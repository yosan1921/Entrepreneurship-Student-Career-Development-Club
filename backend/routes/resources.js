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
        cb(null, `resource-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/zip',
            'application/x-zip-compressed',
            'video/mp4',
            'application/octet-stream'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type not allowed: ${file.mimetype}`), false);
        }
    }
});

// Derive a clean file type label from mimetype or extension
function getFileTypeLabel(mimetype, originalname) {
    const ext = path.extname(originalname || '').toLowerCase().replace('.', '');
    const mimeMap = {
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-powerpoint': 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'application/zip': 'zip',
        'application/x-zip-compressed': 'zip',
        'video/mp4': 'mp4'
    };
    return mimeMap[mimetype] || ext || 'file';
}

// Default resource categories
const DEFAULT_CATEGORIES = [
    'CV & Resume Templates',
    'Internship & Job Guides',
    'Research Papers',
    'Student Handbook',
    'Scholarship Information',
    'Business Proposal Templates',
    'Training Videos',
    'Meeting Minutes',
    'Official Documents',
    'Event Materials',
    'Annual Reports',
    'E-books'
];

// Seed default categories if they don't exist
async function seedDefaultCategories(db) {
    try {
        const existing = await db.collection('resource_categories').countDocuments({});
        if (existing === 0) {
            const docs = DEFAULT_CATEGORIES.map(name => ({
                name,
                description: '',
                createdAt: new Date()
            }));
            await db.collection('resource_categories').insertMany(docs);
            console.log('✅ Seeded default resource categories');
        }
    } catch (err) {
        console.error('⚠️ Could not seed categories:', err.message);
    }
}

// ================== PUBLIC ROUTES ==================

// Get all published resources (public)
router.get('/', async (req, res) => {
    try {
        const { category, search, page = 1, limit = 12 } = req.query;
        const db = getDB();

        // Seed categories on first use
        await seedDefaultCategories(db);

        let query = { isPublished: true };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (category && category !== 'All') {
            query.category = category;
        }

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [results, total] = await Promise.all([
            db.collection('resources')
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .toArray(),
            db.collection('resources').countDocuments(query)
        ]);

        res.json({
            success: true,
            resources: results.map(r => ({ ...r, id: r._id })),
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        });
    } catch (err) {
        console.error('❌ GET /api/resources error:', err);
        return res.status(500).json({ success: false, message: 'Error fetching resources', error: err.message });
    }
});

// Get categories (public)
router.get('/categories', async (req, res) => {
    try {
        const db = getDB();
        await seedDefaultCategories(db);
        const results = await db.collection('resource_categories').find({}).sort({ name: 1 }).toArray();
        res.json({ success: true, categories: results.map(c => ({ ...c, id: c._id })) });
    } catch (err) {
        console.error('❌ GET /api/resources/categories error:', err);
        return res.status(500).json({ success: false, message: 'Error fetching categories', error: err.message });
    }
});

// Get tags (stub)
router.get('/tags', (req, res) => res.json({ success: true, tags: [] }));

// ================== ADMIN ROUTES ==================

// Get all resources (admin) — includes unpublished
router.get('/admin', verifyToken, async (req, res) => {
    try {
        const { category, status, search, page = 1, limit = 20 } = req.query;
        const db = getDB();

        let query = {};

        if (status === 'published') query.isPublished = true;
        else if (status === 'unpublished') query.isPublished = false;

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (category && category !== 'All') {
            query.category = category;
        }

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        const [results, total] = await Promise.all([
            db.collection('resources')
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .toArray(),
            db.collection('resources').countDocuments(query)
        ]);

        res.json({
            success: true,
            resources: results.map(r => ({ ...r, id: r._id })),
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        });
    } catch (err) {
        console.error('❌ GET /api/resources/admin error:', err);
        return res.status(500).json({ success: false, message: 'Error fetching resources', error: err.message });
    }
});

// Create resource (admin) — multipart/form-data
router.post('/admin', verifyToken, upload.single('file'), async (req, res) => {
    try {
        const { title, description, category, isPublished } = req.body;

        if (!title || title.trim() === '') {
            // Clean up uploaded file if validation fails
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'A file is required' });
        }

        const db = getDB();
        const newResource = {
            title: title.trim(),
            description: description ? description.trim() : '',
            category: category || 'Official Documents',
            fileName: req.file.originalname,
            filePath: req.file.filename,
            fileType: getFileTypeLabel(req.file.mimetype, req.file.originalname),
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            isPublished: isPublished === 'true' || isPublished === true,
            downloadCount: 0,
            uploadedBy: req.user ? req.user.id : null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('resources').insertOne(newResource);

        res.status(201).json({
            success: true,
            message: 'Resource created successfully',
            resource: { ...newResource, id: result.insertedId }
        });
    } catch (err) {
        console.error('❌ POST /api/resources/admin error:', err);
        if (req.file && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch (_) { }
        }
        return res.status(500).json({ success: false, message: 'Error creating resource', error: err.message });
    }
});

// Update resource metadata (admin)
router.put('/admin/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid resource ID' });
        }

        const { title, description, category, isPublished } = req.body;
        const db = getDB();

        const existing = await db.collection('resources').findOne({ _id: new ObjectId(id) });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }

        const updateFields = { updatedAt: new Date() };
        if (title !== undefined) updateFields.title = title.trim();
        if (description !== undefined) updateFields.description = description.trim();
        if (category !== undefined) updateFields.category = category;
        if (isPublished !== undefined) updateFields.isPublished = isPublished === 'true' || isPublished === true || isPublished === 1;

        await db.collection('resources').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateFields }
        );

        const updated = await db.collection('resources').findOne({ _id: new ObjectId(id) });
        res.json({ success: true, message: 'Resource updated successfully', resource: { ...updated, id: updated._id } });
    } catch (err) {
        console.error('❌ PUT /api/resources/admin/:id error:', err);
        return res.status(500).json({ success: false, message: 'Error updating resource', error: err.message });
    }
});

// Toggle publish/unpublish (admin)
router.patch('/admin/:id/publish', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid resource ID' });
        }

        const db = getDB();
        const existing = await db.collection('resources').findOne({ _id: new ObjectId(id) });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }

        const newPublished = !existing.isPublished;
        await db.collection('resources').updateOne(
            { _id: new ObjectId(id) },
            { $set: { isPublished: newPublished, updatedAt: new Date() } }
        );

        res.json({
            success: true,
            message: newPublished ? 'Resource published' : 'Resource unpublished',
            isPublished: newPublished
        });
    } catch (err) {
        console.error('❌ PATCH /api/resources/admin/:id/publish error:', err);
        return res.status(500).json({ success: false, message: 'Error toggling publish', error: err.message });
    }
});

// Delete resource (admin)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
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

        // Delete physical file
        if (resource.filePath) {
            const filePath = path.join(__dirname, '../uploads/resources', resource.filePath);
            if (fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch (e) {
                    console.error('⚠️ Could not delete file:', e.message);
                }
            }
        }

        res.json({ success: true, message: 'Resource deleted successfully' });
    } catch (err) {
        console.error('❌ DELETE /api/resources/:id error:', err);
        return res.status(500).json({ success: false, message: 'Error deleting resource', error: err.message });
    }
});

// Admin categories (protected)
router.get('/admin/categories', verifyToken, async (req, res) => {
    try {
        const db = getDB();
        await seedDefaultCategories(db);
        const results = await db.collection('resource_categories').find({}).sort({ name: 1 }).toArray();
        res.json({ success: true, categories: results.map(c => ({ ...c, id: c._id })) });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error fetching categories' });
    }
});

// Stats (admin)
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const db = getDB();
        const [total, published, unpublished, downloadsAgg] = await Promise.all([
            db.collection('resources').countDocuments({}),
            db.collection('resources').countDocuments({ isPublished: true }),
            db.collection('resources').countDocuments({ isPublished: false }),
            db.collection('resources').aggregate([
                { $group: { _id: null, total: { $sum: '$downloadCount' } } }
            ]).toArray()
        ]);

        res.json({
            success: true,
            stats: {
                total_resources: total,
                active_resources: published,
                unpublished_resources: unpublished,
                total_downloads: downloadsAgg[0]?.total || 0
            }
        });
    } catch (err) {
        console.error('❌ GET /api/resources/stats error:', err);
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
        const resource = await db.collection('resources').findOne({ _id: new ObjectId(resourceId) });

        if (!resource) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }

        if (!resource.filePath) {
            return res.status(400).json({ success: false, message: 'Resource has no file' });
        }

        const fullPath = path.join(__dirname, '../uploads/resources', resource.filePath);

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ success: false, message: 'File not found on server' });
        }

        const stats = fs.statSync(fullPath);
        if (!stats.isFile()) {
            return res.status(400).json({ success: false, message: 'Path does not point to a valid file' });
        }

        // Increment download count
        await db.collection('resources').updateOne(
            { _id: new ObjectId(resourceId) },
            { $inc: { downloadCount: 1 } }
        );

        const fileName = resource.fileName || resource.filePath;
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        res.setHeader('Content-Type', resource.mimeType || 'application/octet-stream');
        res.setHeader('Content-Length', stats.size);

        fs.createReadStream(fullPath).pipe(res);
    } catch (err) {
        console.error('❌ Download error:', err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Error processing download' });
        }
    }
}

// Download resource file
router.get('/:id/download', handleResourceDownload);
router.post('/:id/download', handleResourceDownload);

module.exports = router;
