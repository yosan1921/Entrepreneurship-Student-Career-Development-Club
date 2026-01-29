const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');
const { verifyToken, requireRole, getCurrentUser } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/resources');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// ================== PUBLIC ROUTES ==================

// Get all active resources (public)
router.get('/', async (req, res) => {
    try {
        console.log('📚 GET /api/resources called');
        const { category, type, search, featured, limit = 50, offset = 0 } = req.query;
        const db = getDB();

        let query = { status: 'Active' };

        if (type) {
            query.type = type;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (featured === 'true') {
            query.featured = { $in: [1, true] };
        }

        // Handle category if provided (look up category_id first)
        if (category) {
            const cat = await db.collection('resource_categories').findOne({ name: category });
            if (cat) {
                query.category_id = cat._id.toString();
            } else {
                // If category not found, return empty results
                return res.json({ success: true, resources: [], total: 0 });
            }
        }

        const results = await db.collection('resources')
            .find(query)
            .sort({ pinned: -1, featured: -1, uploaded_at: -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .toArray();

        // Fetch categories to map names
        const categories = await db.collection('resource_categories').find({}).toArray();
        const catMap = {};
        categories.forEach(c => catMap[c._id.toString()] = c.name);

        const resourcesWithCat = results.map(r => ({
            ...r,
            id: r._id,
            category_name: catMap[r.category_id] || 'Uncategorized'
        }));

        console.log(`✅ GET /api/resources successful: ${results.length} resources found`);

        res.json({
            success: true,
            resources: resourcesWithCat,
            total: resourcesWithCat.length
        });
    } catch (err) {
        console.error('❌ Database error in GET /api/resources:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching resources',
            error: err.message
        });
    }
});

// Get categories
router.get('/categories', async (req, res) => {
    try {
        console.log('📂 GET /api/resources/categories called');
        const db = getDB();
        const results = await db.collection('resource_categories').find({}).sort({ name: 1 }).toArray();

        res.json({
            success: true,
            categories: results.map(c => ({ ...c, id: c._id }))
        });
    } catch (err) {
        console.error('❌ Database error in GET /api/resources/categories:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: err.message
        });
    }
});

// Get tags
router.get('/tags', (req, res) => {
    res.json({
        success: true,
        tags: []
    });
});

// Debug endpoint to check table structure
router.get('/debug/table', (req, res) => {
    res.json({
        success: true,
        message: 'MongoDB uses collections, not tables with fixed structures.'
    });
});

// Create resource (public endpoint for testing - deprecated/migrated to use MongoDB)
router.post('/', upload.single('file'), async (req, res) => {
    try {
        console.log('📝 POST /api/resources called');
        const { title, description, category_id, file_url, type, featured, pinned, status } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        let resourceType = type || 'link';
        let filePath = '';

        if (req.file) {
            resourceType = 'file';
            filePath = req.file.filename;
        } else if (file_url && file_url.trim() !== '') {
            resourceType = 'link';
            filePath = file_url.trim();
        }

        const db = getDB();
        const newItem = {
            title: title.trim(),
            description: description ? description.trim() : '',
            category_id: category_id || null,
            type: resourceType,
            file_path: filePath,
            status: status || 'Active',
            featured: featured === 'true' || featured === true ? 1 : 0,
            pinned: pinned === 'true' || pinned === true ? 1 : 0,
            uploaded_at: new Date(),
            download_count: 0,
            created_by: null
        };

        const result = await db.collection('resources').insertOne(newItem);

        res.json({
            success: true,
            message: 'Resource created successfully',
            resource: { id: result.insertedId, ...newItem }
        });
    } catch (err) {
        console.error('❌ Error in POST /api/resources:', err);
        return res.status(500).json({ success: false, message: 'Error creating resource', error: err.message });
    }
});

// ================== ADMIN ROUTES ==================

// Get all resources (admin)
router.get('/admin', verifyToken, async (req, res) => {
    try {
        console.log('🔧 GET /api/resources/admin called');
        const { category, status, search, limit = 100, offset = 0 } = req.query;
        const db = getDB();

        let query = {};

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            const cat = await db.collection('resource_categories').findOne({ name: category });
            if (cat) {
                query.category_id = cat._id.toString();
            } else {
                return res.json({ success: true, resources: [], total: 0 });
            }
        }

        const results = await db.collection('resources')
            .find(query)
            .sort({ pinned: -1, featured: -1, uploaded_at: -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .toArray();

        // Fetch related data
        const categories = await db.collection('resource_categories').find({}).toArray();
        const catMap = {};
        categories.forEach(c => catMap[c._id.toString()] = c.name);

        const adminUsers = await db.collection('admin_users').find({}).toArray();
        const userMap = {};
        adminUsers.forEach(u => userMap[u._id.toString()] = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username);

        const resourcesProcessed = results.map(r => ({
            ...r,
            id: r._id,
            category_name: catMap[r.category_id] || 'Uncategorized',
            created_by_name: userMap[r.created_by?.toString()] || 'System',
            updated_by_name: userMap[r.updated_by?.toString()] || 'System'
        }));

        const total = await db.collection('resources').countDocuments(query);

        res.json({
            success: true,
            resources: resourcesProcessed,
            total,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: (parseInt(offset) + results.length) < total
            }
        });
    } catch (err) {
        console.error('❌ Error in GET /api/resources/admin:', err);
        return res.status(500).json({ success: false, message: 'Error fetching resources', error: err.message });
    }
});

// Create resource (admin)
router.post('/admin', verifyToken, upload.single('file'), async (req, res) => {
    try {
        console.log('📝 POST /api/resources/admin called');
        const { title, description, category_id, file_url, type, featured, pinned, status } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        let resourceType = type || 'link';
        let filePath = '';

        if (req.file) {
            resourceType = 'file';
            filePath = req.file.filename;
        } else if (file_url && file_url.trim() !== '') {
            resourceType = 'link';
            filePath = file_url.trim();
        }

        const db = getDB();
        const newItem = {
            title: title.trim(),
            description: description ? description.trim() : '',
            category_id: category_id || null,
            type: resourceType,
            file_path: filePath,
            status: status || 'Active',
            featured: featured === 'true' || featured === true ? 1 : 0,
            pinned: pinned === 'true' || pinned === true ? 1 : 0,
            uploaded_at: new Date(),
            download_count: 0,
            created_by: req.user ? req.user.id : null
        };

        const result = await db.collection('resources').insertOne(newItem);

        res.json({
            success: true,
            message: 'Resource created successfully',
            resource: { id: result.insertedId, ...newItem }
        });
    } catch (err) {
        console.error('❌ Error in POST /api/resources/admin:', err);
        return res.status(500).json({ success: false, message: 'Error creating resource', error: err.message });
    }
});

// Delete resource
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        console.log('🗑️ DELETE /api/resources/:id called');
        const resourceId = req.params.id;
        if (!ObjectId.isValid(resourceId)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        const db = getDB();
        const resource = await db.collection('resources').findOne({ _id: new ObjectId(resourceId) });

        if (!resource) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }

        await db.collection('resources').deleteOne({ _id: new ObjectId(resourceId) });

        // Physical file deletion
        if (resource.type === 'file' && resource.file_path) {
            const filePath = path.join(__dirname, '../uploads/resources', resource.file_path);
            if (fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch (e) {
                    console.error('⚠️ Warning: Could not delete physical file:', e.message);
                }
            }
        }

        res.json({ success: true, message: 'Resource deleted successfully' });
    } catch (err) {
        console.error('❌ Error in DELETE /api/resources/:id:', err);
        return res.status(500).json({ success: false, message: 'Error deleting resource', error: err.message });
    }
});

// Get categories for admin
router.get('/admin/categories', verifyToken, async (req, res) => {
    try {
        const db = getDB();
        const results = await db.collection('resource_categories').find({}).sort({ name: 1 }).toArray();
        res.json({ success: true, categories: results.map(c => ({ ...c, id: c._id })) });
    } catch (err) {
        console.error('❌ Error in GET /api/resources/admin/categories:', err);
        return res.status(500).json({ success: false, message: 'Error fetching categories' });
    }
});

// Get stats endpoint
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const db = getDB();
        const [
            total_resources,
            active_resources,
            featured_resources,
            total_downloads,
            file_resources,
            link_resources
        ] = await Promise.all([
            db.collection('resources').countDocuments({}),
            db.collection('resources').countDocuments({ status: 'Active' }),
            db.collection('resources').countDocuments({ featured: { $in: [1, true] } }),
            db.collection('resources').aggregate([{ $group: { _id: null, total: { $sum: "$download_count" } } }]).toArray(),
            db.collection('resources').countDocuments({ type: 'file' }),
            db.collection('resources').countDocuments({ type: 'link' })
        ]);

        res.json({
            success: true,
            stats: {
                total_resources,
                active_resources,
                featured_resources,
                total_downloads: total_downloads[0]?.total || 0,
                file_resources,
                link_resources
            }
        });
    } catch (err) {
        console.error('❌ Error in GET /api/resources/stats:', err);
        return res.status(500).json({ success: false, message: 'Error fetching stats' });
    }
});

// Shared download handler function
async function handleResourceDownload(req, res) {
    try {
        const resourceId = req.params.id;
        if (!ObjectId.isValid(resourceId)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        const db = getDB();
        const resource = await db.collection('resources').findOne({ _id: new ObjectId(resourceId), status: "Active" });

        if (!resource) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }

        if (resource.type === 'link') {
            return res.json({ success: true, message: 'Link resource', downloadUrl: resource.file_path, type: 'link' });
        }

        if (resource.type !== 'file' || !resource.file_path) {
            return res.status(400).json({ success: false, message: 'Resource is not downloadable' });
        }

        const fullPath = path.join(__dirname, '../uploads/resources', resource.file_path);

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ success: false, message: 'File not found on server' });
        }

        const stats = fs.statSync(fullPath);
        if (!stats.isFile()) {
            return res.status(400).json({ success: false, message: 'Path does not point to a valid file' });
        }

        // Update download count
        await db.collection('resources').updateOne(
            { _id: new ObjectId(resourceId) },
            { $inc: { download_count: 1 } }
        );

        const fileName = resource.file_name || resource.file_path;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', resource.file_type || 'application/octet-stream');
        res.setHeader('Content-Length', stats.size);

        fs.createReadStream(fullPath).pipe(res);
    } catch (err) {
        console.error('❌ Error in download handler:', err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Error processing download' });
        }
    }
}

// Download resource file
router.get('/:id/download', handleResourceDownload);
router.post('/:id/download', handleResourceDownload);

module.exports = router;
