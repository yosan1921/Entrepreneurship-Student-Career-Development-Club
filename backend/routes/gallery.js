const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');
const { verifyToken, requireRole, getCurrentUser } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/gallery');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `gallery-${uniqueSuffix}${ext}`);
    }
});

// File filter for images and videos
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|avi|mov|wmv|flv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, JPG, PNG, GIF, WebP) and videos (MP4, AVI, MOV, WMV, FLV, WebM) are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: fileFilter
});

// Get all gallery items (public)
router.get('/', async (req, res) => {
    try {
        const { category, type } = req.query;
        const db = getDB();

        let query = { status: "active" };

        if (category) {
            query.category = category;
        }

        if (type) {
            query.mediaType = type;
        }

        const results = await db.collection('gallery')
            .find(query)
            .sort({ eventDate: -1, createdAt: -1 })
            .toArray();

        // Add full URL for media files
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const galleryWithUrls = results.map(item => ({
            ...item,
            id: item._id,
            mediaUrl: item.filePath ? `${baseUrl}/uploads/gallery/${path.basename(item.filePath)}` : item.imageUrl,
            thumbnailUrl: item.thumbnailPath ? `${baseUrl}/uploads/gallery/thumbnails/${path.basename(item.thumbnailPath)}` : null
        }));

        res.json({
            success: true,
            gallery: galleryWithUrls
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching gallery'
        });
    }
});

// Serve uploaded files
router.get('/files/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({
            success: false,
            message: 'File not found'
        });
    }
});

// Download media file
router.get('/download/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        const db = getDB();
        const item = await db.collection('gallery').findOne({ _id: new ObjectId(id), status: "active" });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        if (!item.filePath) {
            return res.status(404).json({
                success: false,
                message: 'File path not found'
            });
        }

        const filePath = path.isAbsolute(item.filePath)
            ? item.filePath
            : path.join(__dirname, '..', item.filePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server'
            });
        }

        // Increment download count
        await db.collection('gallery').updateOne(
            { _id: new ObjectId(id) },
            { $inc: { downloadCount: 1 } }
        );

        const filename = `${item.title.replace(/[^a-z0-9]/gi, '_')}${path.extname(filePath)}`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.sendFile(filePath);
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching gallery item'
        });
    }
});

// Admin routes - require authentication
router.use(verifyToken);
router.use(getCurrentUser);

// Get all gallery items for admin (including inactive)
router.get('/admin', requireRole(['super_admin', 'admin', 'editor']), async (req, res) => {
    try {
        const db = getDB();
        // Since we don't have SQL joins easily here, we'll fetch all and maybe manually map users if needed
        // But for simplicity with MongoDB, we often denormalize or do a second lookup
        const results = await db.collection('gallery')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        // Fetch admin users to map names
        const adminUsers = await db.collection('admin_users').find({}).toArray();
        const userMap = {};
        adminUsers.forEach(u => userMap[u._id.toString()] = u.username);

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const galleryWithUrls = results.map(item => ({
            ...item,
            id: item._id,
            uploadedByName: userMap[item.uploadedBy?.toString()] || 'Unknown',
            mediaUrl: item.filePath ? `${baseUrl}/uploads/gallery/${path.basename(item.filePath)}` : item.imageUrl,
            thumbnailUrl: item.thumbnailPath ? `${baseUrl}/uploads/gallery/thumbnails/${path.basename(item.thumbnailPath)}` : null
        }));

        res.json({
            success: true,
            gallery: galleryWithUrls
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching gallery'
        });
    }
});

// Upload media files
router.post('/upload', requireRole(['super_admin', 'admin', 'editor']), upload.single('media'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const { title, description, category, eventDate, status } = req.body;

        if (!title) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
        const relativePath = path.join('uploads', 'gallery', req.file.filename);
        const db = getDB();

        const newItem = {
            title,
            description: description || '',
            category: category || 'other',
            eventDate: eventDate ? new Date(eventDate) : null,
            mediaType,
            filePath: relativePath,
            fileName: req.file.filename,
            fileSize: req.file.size,
            uploadedBy: req.user.id,
            status: status || 'active',
            downloadCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('gallery').insertOne(newItem);

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        res.status(201).json({
            success: true,
            message: 'Media uploaded successfully',
            id: result.insertedId,
            mediaUrl: `${baseUrl}/uploads/gallery/${req.file.filename}`,
            mediaType: mediaType,
            fileSize: req.file.size
        });
    } catch (error) {
        console.error('Upload error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Error uploading file'
        });
    }
});

// Create new gallery item (URL-based)
router.post('/', requireRole(['super_admin', 'admin', 'editor']), async (req, res) => {
    try {
        const { title, description, imageUrl, category, eventDate, status } = req.body;

        if (!title || !imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Title and image URL are required'
            });
        }

        const db = getDB();
        const newItem = {
            title,
            description: description || '',
            imageUrl,
            category: category || 'other',
            eventDate: eventDate ? new Date(eventDate) : null,
            uploadedBy: req.user.id,
            status: status || 'active',
            mediaType: 'image',
            downloadCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('gallery').insertOne(newItem);

        res.status(201).json({
            success: true,
            message: 'Gallery item created successfully',
            id: result.insertedId
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error creating gallery item'
        });
    }
});

// Update gallery item
router.put('/:id', requireRole(['super_admin', 'admin', 'editor']), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, imageUrl, category, eventDate, status } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        const db = getDB();
        const updateData = {
            title,
            description,
            imageUrl,
            category,
            eventDate: eventDate ? new Date(eventDate) : null,
            status,
            updatedAt: new Date()
        };

        const result = await db.collection('gallery').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        res.json({
            success: true,
            message: 'Gallery item updated successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error updating gallery item'
        });
    }
});

// Replace media file
router.put('/:id/replace', requireRole(['super_admin', 'admin', 'editor']), upload.single('media'), async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const db = getDB();
        const currentItem = await db.collection('gallery').findOne({ _id: new ObjectId(id) });

        if (!currentItem) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
        const relativePath = path.join('uploads', 'gallery', req.file.filename);

        const result = await db.collection('gallery').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    filePath: relativePath,
                    fileName: req.file.filename,
                    fileSize: req.file.size,
                    mediaType: mediaType,
                    imageUrl: null,
                    updatedAt: new Date()
                }
            }
        );

        // Delete old file if it exists
        if (currentItem.filePath) {
            const oldFilePath = path.isAbsolute(currentItem.filePath)
                ? currentItem.filePath
                : path.join(__dirname, '..', currentItem.filePath);

            if (fs.existsSync(oldFilePath)) {
                try {
                    fs.unlinkSync(oldFilePath);
                } catch (deleteErr) {
                    console.error('Error deleting old file:', deleteErr);
                }
            }
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        res.json({
            success: true,
            message: 'Media file replaced successfully',
            mediaUrl: `${baseUrl}/uploads/gallery/${req.file.filename}`,
            mediaType: mediaType,
            fileSize: req.file.size
        });
    } catch (error) {
        console.error('Replace error:', error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({
            success: false,
            message: 'Error replacing file: ' + error.message
        });
    }
});

// Delete gallery item
router.delete('/:id', requireRole(['super_admin', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        const db = getDB();
        const item = await db.collection('gallery').findOne({ _id: new ObjectId(id) });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        await db.collection('gallery').deleteOne({ _id: new ObjectId(id) });

        // Delete associated files
        if (item.filePath) {
            const filePath = path.isAbsolute(item.filePath)
                ? item.filePath
                : path.join(__dirname, '..', item.filePath);

            if (fs.existsSync(filePath)) {
                try { fs.unlinkSync(filePath); } catch (e) { }
            }
        }

        if (item.thumbnailPath) {
            const thumbnailPath = path.isAbsolute(item.thumbnailPath)
                ? item.thumbnailPath
                : path.join(__dirname, '..', item.thumbnailPath);

            if (fs.existsSync(thumbnailPath)) {
                try { fs.unlinkSync(thumbnailPath); } catch (e) { }
            }
        }

        res.json({
            success: true,
            message: 'Gallery item deleted successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error deleting gallery item'
        });
    }
});

// Get gallery statistics
router.get('/stats', requireRole(['super_admin', 'admin', 'editor']), async (req, res) => {
    try {
        const db = getDB();

        const [
            total,
            active,
            images,
            videos,
            byCategory,
            totalSize,
            totalDownloads
        ] = await Promise.all([
            db.collection('gallery').countDocuments({}),
            db.collection('gallery').countDocuments({ status: "active" }),
            db.collection('gallery').countDocuments({ mediaType: "image" }),
            db.collection('gallery').countDocuments({ mediaType: "video" }),
            db.collection('gallery').aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } }
            ]).toArray(),
            db.collection('gallery').aggregate([
                { $group: { _id: null, totalSize: { $sum: "$fileSize" } } }
            ]).toArray(),
            db.collection('gallery').aggregate([
                { $group: { _id: null, totalDownloads: { $sum: "$downloadCount" } } }
            ]).toArray()
        ]);

        const stats = {
            total,
            active,
            images,
            videos,
            byCategory: byCategory.map(c => ({ category: c._id, count: c.count })),
            totalSize: totalSize[0]?.totalSize || 0,
            totalDownloads: totalDownloads[0]?.totalDownloads || 0
        };

        res.json({
            success: true,
            stats: stats
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching gallery statistics'
        });
    }
});

module.exports = router;
