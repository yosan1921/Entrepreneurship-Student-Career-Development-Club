const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole, getCurrentUser } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Function to ensure leadership table exists
const ensureLeadershipTable = () => {
    return new Promise((resolve, reject) => {
        // Check if table exists first
        const checkTableQuery = `
            SELECT COUNT(*) as tableExists 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() AND table_name = 'leadership'
        `;

        db.query(checkTableQuery, (err, results) => {
            if (err) {
                console.error('Error checking leadership table:', err);
                reject(err);
                return;
            }

            const tableExists = results[0].tableExists > 0;
            if (tableExists) {
                // Table exists, check if id has AUTO_INCREMENT
                const checkAutoIncrementQuery = `
                    SELECT COLUMN_NAME, EXTRA 
                    FROM information_schema.COLUMNS 
                    WHERE TABLE_SCHEMA = DATABASE() 
                    AND TABLE_NAME = 'leadership' 
                    AND COLUMN_NAME = 'id'
                `;

                db.query(checkAutoIncrementQuery, (checkErr, checkResults) => {
                    if (!checkErr && checkResults.length > 0) {
                        const hasAutoIncrement = checkResults[0].EXTRA.includes('auto_increment');
                        if (!hasAutoIncrement) {
                            console.log('🔧 Adding AUTO_INCREMENT to leadership id column...');
                            const alterQuery = 'ALTER TABLE leadership MODIFY COLUMN id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY';
                            db.query(alterQuery, (alterErr) => {
                                if (alterErr) {
                                    console.error('Error adding AUTO_INCREMENT:', alterErr);
                                }
                                resolve();
                            });
                        } else {
                            resolve();
                        }
                    } else {
                        resolve();
                    }
                });
                return;
            }

            // Create table if it doesn't exist (with proper AUTO_INCREMENT)
            const createTableSQL = `
                CREATE TABLE leadership (
                    id int(11) NOT NULL AUTO_INCREMENT,
                    name varchar(100) NOT NULL,
                    position varchar(100) NOT NULL,
                    sector varchar(100) DEFAULT 'Leadership Team',
                    photo varchar(255) DEFAULT NULL,
                    bio text DEFAULT NULL,
                    phone varchar(50) DEFAULT NULL,
                    email varchar(255) DEFAULT NULL,
                    display_order int(11) DEFAULT NULL,
                    status ENUM('active', 'inactive') DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    PRIMARY KEY (id),
                    INDEX idx_sector (sector),
                    INDEX idx_status (status),
                    INDEX idx_display_order (display_order)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=1
            `;

            db.query(createTableSQL, (err) => {
                if (err) {
                    console.error('Error creating leadership table:', err);
                    reject(err);
                } else {
                    console.log('✅ Leadership table created with AUTO_INCREMENT');
                    resolve();
                }
            });
        });
    });
};

// Initialize table on module load
ensureLeadershipTable().catch(err => {
    console.error('Failed to ensure leadership table exists:', err);
});

// Create leadership images directory
const leadershipImagesDir = path.join(__dirname, '../uploads/leadership');
if (!fs.existsSync(leadershipImagesDir)) {
    fs.mkdirSync(leadershipImagesDir, { recursive: true });
}

// Configure multer for leadership image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, leadershipImagesDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `leader_${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// Get all leadership members (public)
router.get('/', async (req, res) => {
    try {
        // Ensure table exists
        await ensureLeadershipTable();

        const query = `
            SELECT * FROM leadership 
            WHERE status = 'active' AND (sector = 'Leadership Team' OR sector IS NULL)
            ORDER BY display_order ASC, id ASC
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Database error while fetching leadership:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching leadership: ' + err.message
                });
            }

            res.json({
                success: true,
                leadership: results
            });
        });
    } catch (error) {
        console.error('Error ensuring leadership table:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

// Admin routes - require authentication
router.use(verifyToken);
router.use(getCurrentUser);

// Get all leadership members for admin (including inactive)
router.get('/admin', requireRole(['super_admin', 'admin', 'editor']), async (req, res) => {
    try {
        // Ensure table exists
        await ensureLeadershipTable();

        const query = 'SELECT * FROM leadership ORDER BY display_order ASC, id ASC';

        db.query(query, (err, results) => {
            if (err) {
                console.error('Database error while fetching leadership (admin):', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching leadership: ' + err.message
                });
            }

            res.json({
                success: true,
                leadership: results
            });
        });
    } catch (error) {
        console.error('Error ensuring leadership table (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

// Create new leadership member
router.post('/', requireRole(['super_admin', 'admin']), upload.single('photo'), (req, res) => {
    const { name, position, email, phone, bio, displayOrder, status } = req.body;

    if (!name || !position) {
        return res.status(400).json({
            success: false,
            message: 'Name and position are required'
        });
    }

    let photoPath = null;
    if (req.file) {
        photoPath = `/uploads/leadership/${req.file.filename}`;
    }

    const query = 'INSERT INTO leadership (name, position, email, phone, bio, display_order, status, photo, sector) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    db.query(query, [name, position, email, phone, bio, displayOrder || 0, status || 'active', photoPath, 'Leadership Team'], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            // Clean up uploaded file if database insert fails
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(500).json({
                success: false,
                message: 'Error creating leadership member: ' + err.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'Leadership member created successfully',
            id: result.insertId,
            data: {
                id: result.insertId,
                name,
                position,
                email,
                phone,
                bio,
                display_order: displayOrder || 0,
                status: status || 'active',
                photo: photoPath,
                sector: 'Leadership Team'
            }
        });
    });
});

// Update leadership member
router.put('/:id', requireRole(['super_admin', 'admin']), upload.single('photo'), (req, res) => {
    const { id } = req.params;
    const { name, position, email, phone, bio, displayOrder, status } = req.body;

    if (!name || !position) {
        return res.status(400).json({
            success: false,
            message: 'Name and position are required'
        });
    }

    // Handle photo upload if provided
    let photoPath = null;
    if (req.file) {
        photoPath = `/uploads/leadership/${req.file.filename}`;
    }

    // Get current data to handle photo replacement
    const getCurrentDataQuery = 'SELECT photo FROM leadership WHERE id = ?';

    db.query(getCurrentDataQuery, [id], (err, results) => {
        if (err) {
            console.error('Database error while checking current data:', err);
            // Clean up uploaded file if database query fails
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(500).json({
                success: false,
                message: 'Error checking current data: ' + err.message
            });
        }

        if (results.length === 0) {
            // Clean up uploaded file if member not found
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                message: 'Leadership member not found'
            });
        }

        const currentPhoto = results[0].photo;

        // Build update query - only update photo if new one is provided
        let query, params;
        if (photoPath) {
            query = 'UPDATE leadership SET name = ?, position = ?, email = ?, phone = ?, bio = ?, display_order = ?, status = ?, photo = ? WHERE id = ?';
            params = [name, position, email, phone, bio, displayOrder, status, photoPath, id];
        } else {
            query = 'UPDATE leadership SET name = ?, position = ?, email = ?, phone = ?, bio = ?, display_order = ?, status = ? WHERE id = ?';
            params = [name, position, email, phone, bio, displayOrder, status, id];
        }

        db.query(query, params, (updateErr, result) => {
            if (updateErr) {
                console.error('Database error:', updateErr);
                // Clean up uploaded file if database update fails
                if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(500).json({
                    success: false,
                    message: 'Error updating leadership member: ' + updateErr.message
                });
            }

            // Delete old photo file if new one was uploaded and update was successful
            if (photoPath && currentPhoto && currentPhoto !== photoPath) {
                const oldImagePath = path.join(__dirname, '..', currentPhoto);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log(`🗑️ Deleted old image: ${oldImagePath}`);
                }
            }

            res.json({
                success: true,
                message: 'Leadership member updated successfully',
                data: {
                    id: parseInt(id),
                    name,
                    position,
                    email,
                    phone,
                    bio,
                    display_order: displayOrder,
                    status,
                    photo: photoPath || currentPhoto
                }
            });
        });
    });
});

// Upload leadership member image
router.post('/:id/upload-image', requireRole(['super_admin', 'admin']), upload.single('image'), (req, res) => {
    const { id } = req.params;

    console.log(`🖼️ Attempting to upload image for leadership member ID: ${id}`);

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No image file uploaded'
        });
    }

    const imagePath = `/uploads/leadership/${req.file.filename}`;

    // Get current image to delete old one
    const getCurrentImageQuery = 'SELECT photo FROM leadership WHERE id = ?';

    db.query(getCurrentImageQuery, [id], (err, results) => {
        if (err) {
            console.error('Database error while checking current image:', err);
            // Clean up uploaded file
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(500).json({
                success: false,
                message: 'Error checking current image: ' + err.message
            });
        }

        console.log(`📊 Query results for ID ${id}:`, results);

        if (results.length === 0) {
            console.log(`❌ Leadership member with ID ${id} not found`);
            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: `Leadership member with ID ${id} not found`
            });
        }

        const currentImage = results[0].photo;
        console.log(`📸 Current image for member ${id}: ${currentImage || 'None'}`);

        // Update database with new image path
        const updateQuery = 'UPDATE leadership SET photo = ? WHERE id = ?';

        db.query(updateQuery, [imagePath, id], (updateErr, updateResult) => {
            if (updateErr) {
                console.error('Database error:', updateErr);
                // Clean up uploaded file
                fs.unlinkSync(req.file.path);
                return res.status(500).json({
                    success: false,
                    message: 'Error updating image'
                });
            }

            console.log(`✅ Image updated for member ${id}, affected rows: ${updateResult.affectedRows}`);

            // Delete old image file if it exists
            if (currentImage && currentImage !== imagePath) {
                const oldImagePath = path.join(__dirname, '..', currentImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log(`🗑️ Deleted old image: ${oldImagePath}`);
                }
            }

            const baseUrl = `${req.protocol}://${req.get('host')}`;
            res.json({
                success: true,
                message: 'Image uploaded successfully',
                data: {
                    imagePath: imagePath,
                    imageUrl: `${baseUrl}${imagePath}`
                }
            });
        });
    });
});

// Delete leadership member image
router.delete('/:id/image', requireRole(['super_admin', 'admin']), (req, res) => {
    const { id } = req.params;

    console.log(`🗑️ Attempting to delete image for leadership member ID: ${id}`);

    // Get current image path
    const getCurrentImageQuery = 'SELECT photo FROM leadership WHERE id = ?';

    db.query(getCurrentImageQuery, [id], (err, results) => {
        if (err) {
            console.error('Database error while checking current image for deletion:', err);
            return res.status(500).json({
                success: false,
                message: 'Error checking current image: ' + err.message
            });
        }

        console.log(`📊 Query results for ID ${id}:`, results);

        if (results.length === 0) {
            console.log(`❌ Leadership member with ID ${id} not found`);
            return res.status(404).json({
                success: false,
                message: `Leadership member with ID ${id} not found`
            });
        }

        const currentImage = results[0].photo;
        console.log(`📸 Current image for member ${id}: ${currentImage || 'None'}`);

        // Update database to remove image
        const updateQuery = 'UPDATE leadership SET photo = NULL WHERE id = ?';

        db.query(updateQuery, [id], (updateErr) => {
            if (updateErr) {
                console.error('Database error:', updateErr);
                return res.status(500).json({
                    success: false,
                    message: 'Error removing image'
                });
            }

            console.log(`✅ Image reference removed for member ${id}`);

            // Delete image file if it exists
            if (currentImage) {
                const imagePath = path.join(__dirname, '..', currentImage);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log(`🗑️ Deleted image file: ${imagePath}`);
                } else {
                    console.log(`⚠️ Image file not found: ${imagePath}`);
                }
            }

            res.json({
                success: true,
                message: 'Image removed successfully'
            });
        });
    });
});

// Delete leadership member
router.delete('/:id', requireRole(['super_admin', 'admin']), (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM leadership WHERE id = ?';

    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error deleting leadership member'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Leadership member not found'
            });
        }

        res.json({
            success: true,
            message: 'Leadership member deleted successfully'
        });
    });
});

module.exports = router;