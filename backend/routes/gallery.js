const express = require('express');
const router = express.Router();
const db = require('../db');
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
router.get('/', (req, res) => {
    const { category, type } = req.query;
    let query = 'SELECT * FROM gallery WHERE status = "active"';
    let params = [];

    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }

    if (type) {
        query += ' AND mediaType = ?';
        params.push(type);
    }

    query += ' ORDER BY eventDate DESC, createdAt DESC';

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching gallery'
            });
        }

        // Add full URL for media files
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const galleryWithUrls = results.map(item => ({
            ...item,
            mediaUrl: item.filePath ? `${baseUrl}/uploads/gallery/${path.basename(item.filePath)}` : item.imageUrl,
            thumbnailUrl: item.thumbnailPath ? `${baseUrl}/uploads/gallery/thumbnails/${path.basename(item.thumbnailPath)}` : null
        }));

        res.json({
            success: true,
            gallery: galleryWithUrls
        });
    });
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
router.get('/download/:id', (req, res) => {
    const { id } = req.params;

    const query = 'SELECT * FROM gallery WHERE id = ? AND status = "active"';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching gallery item'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        const item = results[0];
        if (!item.filePath) {
            return res.status(404).json({
                success: false,
                message: 'File path not found'
            });
        }

        // Handle both absolute and relative paths
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
        const updateQuery = 'UPDATE gallery SET downloadCount = downloadCount + 1 WHERE id = ?';
        db.query(updateQuery, [id], (updateErr) => {
            if (updateErr) {
                console.error('Error updating download count:', updateErr);
            }
        });

        // Set appropriate headers for download
        const filename = `${item.title.replace(/[^a-z0-9]/gi, '_')}${path.extname(filePath)}`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.sendFile(filePath);
    });
});

// Admin routes - require authentication
router.use(verifyToken);
router.use(getCurrentUser);

// Get all gallery items for admin (including inactive)
router.get('/admin', requireRole(['super_admin', 'admin', 'editor']), (req, res) => {
    const query = `
    SELECT g.*, au.username as uploadedByName 
    FROM gallery g 
    LEFT JOIN admin_users au ON g.uploadedBy = au.id 
    ORDER BY g.createdAt DESC
  `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching gallery'
            });
        }

        // Add full URL for media files
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const galleryWithUrls = results.map(item => ({
            ...item,
            mediaUrl: item.filePath ? `${baseUrl}/uploads/gallery/${path.basename(item.filePath)}` : item.imageUrl,
            thumbnailUrl: item.thumbnailPath ? `${baseUrl}/uploads/gallery/thumbnails/${path.basename(item.thumbnailPath)}` : null
        }));

        res.json({
            success: true,
            gallery: galleryWithUrls
        });
    });
});

// Upload media files
router.post('/upload', requireRole(['super_admin', 'admin', 'editor']), upload.single('media'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const { title, description, category, eventDate, status } = req.body;

        if (!title) {
            // Clean up uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        // Determine media type
        const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

        // Use relative path for database storage
        const relativePath = path.join('uploads', 'gallery', req.file.filename);

        const query = `
            INSERT INTO gallery 
            (title, description, category, eventDate, mediaType, filePath, fileName, fileSize, uploadedBy, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            title,
            description || '',
            category || 'other',
            eventDate || null,
            mediaType,
            relativePath,
            req.file.filename,
            req.file.size,
            req.user.id,
            status || 'active'
        ];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                // Clean up uploaded file if database insert fails
                fs.unlinkSync(req.file.path);
                return res.status(500).json({
                    success: false,
                    message: 'Error saving gallery item'
                });
            }

            const baseUrl = `${req.protocol}://${req.get('host')}`;
            res.status(201).json({
                success: true,
                message: 'Media uploaded successfully',
                id: result.insertId,
                mediaUrl: `${baseUrl}/uploads/gallery/${req.file.filename}`,
                mediaType: mediaType,
                fileSize: req.file.size
            });
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
router.post('/', requireRole(['super_admin', 'admin', 'editor']), (req, res) => {
    const { title, description, imageUrl, category, eventDate, status } = req.body;

    if (!title || !imageUrl) {
        return res.status(400).json({
            success: false,
            message: 'Title and image URL are required'
        });
    }

    const query = 'INSERT INTO gallery (title, description, imageUrl, category, eventDate, uploadedBy, status, mediaType) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(query, [title, description, imageUrl, category || 'other', eventDate, req.user.id, status || 'active', 'image'], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error creating gallery item'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Gallery item created successfully',
            id: result.insertId
        });
    });
});

// Update gallery item
router.put('/:id', requireRole(['super_admin', 'admin', 'editor']), (req, res) => {
    const { id } = req.params;
    const { title, description, imageUrl, category, eventDate, status } = req.body;

    if (!title) {
        return res.status(400).json({
            success: false,
            message: 'Title is required'
        });
    }

    // First get the current item to check if it exists
    const selectQuery = 'SELECT * FROM gallery WHERE id = ?';
    db.query(selectQuery, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching gallery item'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        const updateQuery = 'UPDATE gallery SET title = ?, description = ?, imageUrl = ?, category = ?, eventDate = ?, status = ? WHERE id = ?';

        db.query(updateQuery, [title, description, imageUrl, category, eventDate, status, id], (updateErr, result) => {
            if (updateErr) {
                console.error('Database error:', updateErr);
                return res.status(500).json({
                    success: false,
                    message: 'Error updating gallery item'
                });
            }

            res.json({
                success: true,
                message: 'Gallery item updated successfully'
            });
        });
    });
});

// Replace media file
router.put('/:id/replace', requireRole(['super_admin', 'admin', 'editor']), upload.single('media'), (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Get current gallery item
        const selectQuery = 'SELECT * FROM gallery WHERE id = ?';
        db.query(selectQuery, [id], (err, results) => {
            if (err) {
                console.error('Database error fetching gallery item:', err);
                if (req.file && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching gallery item'
                });
            }

            if (results.length === 0) {
                if (req.file && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(404).json({
                    success: false,
                    message: 'Gallery item not found'
                });
            }

            const currentItem = results[0];
            const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

            // Use relative path for database storage
            const relativePath = path.join('uploads', 'gallery', req.file.filename);

            // Update database with new file info
            const updateQuery = `
                UPDATE gallery 
                SET filePath = ?, fileName = ?, fileSize = ?, mediaType = ?, imageUrl = NULL, updatedAt = NOW()
                WHERE id = ?
            `;

            const updateValues = [relativePath, req.file.filename, req.file.size, mediaType, id];

            console.log('Updating gallery item:', { id, relativePath, fileName: req.file.filename, fileSize: req.file.size, mediaType });

            db.query(updateQuery, updateValues, (updateErr, updateResult) => {
                if (updateErr) {
                    console.error('Database error updating gallery item:', updateErr);
                    console.error('Update values:', updateValues);
                    if (req.file && fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                    }
                    return res.status(500).json({
                        success: false,
                        message: 'Error updating gallery item: ' + updateErr.message
                    });
                }

                console.log('Update result:', updateResult);

                // Delete old file if it exists
                if (currentItem.filePath) {
                    const oldFilePath = path.isAbsolute(currentItem.filePath)
                        ? currentItem.filePath
                        : path.join(__dirname, '..', currentItem.filePath);

                    if (fs.existsSync(oldFilePath)) {
                        try {
                            fs.unlinkSync(oldFilePath);
                            console.log('Deleted old file:', oldFilePath);
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
            });
        });

    } catch (error) {
        console.error('Replace error:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Error replacing file: ' + error.message
        });
    }
});

// Delete gallery item
router.delete('/:id', requireRole(['super_admin', 'admin']), (req, res) => {
    const { id } = req.params;

    // First get the item to check for associated files
    const selectQuery = 'SELECT * FROM gallery WHERE id = ?';
    db.query(selectQuery, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching gallery item'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        const item = results[0];

        // Delete from database
        const deleteQuery = 'DELETE FROM gallery WHERE id = ?';
        db.query(deleteQuery, [id], (deleteErr, result) => {
            if (deleteErr) {
                console.error('Database error:', deleteErr);
                return res.status(500).json({
                    success: false,
                    message: 'Error deleting gallery item'
                });
            }

            // Delete associated files
            if (item.filePath) {
                const filePath = path.isAbsolute(item.filePath)
                    ? item.filePath
                    : path.join(__dirname, '..', item.filePath);

                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (fileErr) {
                        console.error('Error deleting file:', fileErr);
                    }
                }
            }

            if (item.thumbnailPath) {
                const thumbnailPath = path.isAbsolute(item.thumbnailPath)
                    ? item.thumbnailPath
                    : path.join(__dirname, '..', item.thumbnailPath);

                if (fs.existsSync(thumbnailPath)) {
                    try {
                        fs.unlinkSync(thumbnailPath);
                    } catch (fileErr) {
                        console.error('Error deleting thumbnail:', fileErr);
                    }
                }
            }

            res.json({
                success: true,
                message: 'Gallery item deleted successfully'
            });
        });
    });
});

// Get gallery statistics
router.get('/stats', requireRole(['super_admin', 'admin', 'editor']), (req, res) => {
    const queries = {
        total: 'SELECT COUNT(*) as count FROM gallery',
        active: 'SELECT COUNT(*) as count FROM gallery WHERE status = "active"',
        images: 'SELECT COUNT(*) as count FROM gallery WHERE mediaType = "image"',
        videos: 'SELECT COUNT(*) as count FROM gallery WHERE mediaType = "video"',
        byCategory: 'SELECT category, COUNT(*) as count FROM gallery GROUP BY category',
        totalSize: 'SELECT SUM(fileSize) as totalSize FROM gallery WHERE filePath IS NOT NULL',
        totalDownloads: 'SELECT SUM(downloadCount) as count FROM gallery'
    };

    const stats = {};
    let completed = 0;
    const totalQueries = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
        db.query(query, (err, results) => {
            if (err) {
                console.error(`Error in ${key} query:`, err);
                stats[key] = key === 'byCategory' ? [] : 0;
            } else {
                if (key === 'byCategory') {
                    stats[key] = results;
                } else if (key === 'totalSize') {
                    stats[key] = results[0].totalSize || 0;
                } else {
                    stats[key] = results[0].count;
                }
            }

            completed++;
            if (completed === totalQueries) {
                res.json({
                    success: true,
                    stats: stats
                });
            }
        });
    });
});

module.exports = router;