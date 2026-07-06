const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
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

// File filter for all types
const fileFilter = (req, file, cb) => {
    // Allow all file formats
    return cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: fileFilter
});

// Test upload endpoint (NO AUTHENTICATION REQUIRED)
router.post('/upload', upload.single('media'), async (req, res) => {
    try {
        console.log('📤 Upload request received');
        console.log('File:', req.file);
        console.log('Body:', req.body);

        if (!req.file) {
            console.log('❌ No file uploaded');
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const { title, description, category, eventDate, status } = req.body;

        if (!title) {
            console.log('❌ No title provided');
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
            uploadedBy: "test_user", // Simplified for test endpoint
            status: status || 'active',
            downloadCount: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        console.log('💾 Saving to database...');
        const result = await db.collection('gallery').insertOne(newItem);

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        console.log('✅ Upload successful!');

        res.status(201).json({
            success: true,
            message: 'Media uploaded successfully',
            data: {
                id: result.insertedId,
                title: title,
                mediaType: mediaType,
                fileName: req.file.filename,
                fileSize: req.file.size,
                mediaUrl: `${baseUrl}/uploads/gallery/${req.file.filename}`,
                uploadedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('❌ Upload error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error.message
        });
    }
});

// Test multiple upload endpoint
router.post('/upload-multiple', upload.array('media', 20), async (req, res) => {
    try {
        console.log('📤 Multiple upload request received');
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const { title, description, category, eventDate, status } = req.body;
        const db = getDB();
        const results = [];
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
            const relativePath = path.join('uploads', 'gallery', file.filename);
            
            // Use provided title with an index, or fallback to something generic
            const itemTitle = title ? (req.files.length > 1 ? `${title} ${i+1}` : title) : `Upload ${i+1}`;

            const newItem = {
                title: itemTitle,
                description: description || '',
                category: category || 'other',
                eventDate: eventDate ? new Date(eventDate) : null,
                mediaType,
                filePath: relativePath,
                fileName: file.filename,
                fileSize: file.size,
                uploadedBy: "test_user",
                status: status || 'active',
                downloadCount: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await db.collection('gallery').insertOne(newItem);
            
            results.push({
                id: result.insertedId,
                title: itemTitle,
                mediaType: mediaType,
                fileName: file.filename,
                fileSize: file.size,
                mediaUrl: `${baseUrl}/uploads/gallery/${file.filename}`,
                uploadedAt: new Date().toISOString()
            });
        }

        console.log(`✅ Multiple upload successful! (${req.files.length} files)`);

        res.status(201).json({
            success: true,
            message: `${req.files.length} files uploaded successfully`,
            data: results,
            uploaded: results
        });
    } catch (error) {
        console.error('❌ Multiple upload error:', error);
        if (req.files) {
            req.files.forEach(file => {
                try { fs.unlinkSync(file.path); } catch(e) {}
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error uploading files',
            error: error.message
        });
    }
});

module.exports = router;

module.exports = router;