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

module.exports = router;

module.exports = router;