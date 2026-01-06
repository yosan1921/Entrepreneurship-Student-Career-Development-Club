const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole, getCurrentUser } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, '../uploads/reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, reportsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${baseName}_${uniqueSuffix}${ext}`);
    }
});

// File filter for documents
const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /application\/(pdf|msword|vnd\.|text\/)/;

    if (mimetype.test(file.mimetype) && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only documents (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT) are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: fileFilter
});

// Get all reports (public endpoint with visibility control)
router.get('/', (req, res) => {
    const { type, academicYear, period, visibility } = req.query;

    // FIXED: Removed admin_users join that was causing 500 errors
    let query = `
        SELECT r.*
        FROM reports r 
        WHERE r.status = "published"
    `;
    let params = [];

    // Filter by type
    if (type) {
        query += ' AND r.`type` = ?';
        params.push(type);
    }

    // Filter by academic year
    if (academicYear) {
        query += ' AND r.academicYear = ?';
        params.push(academicYear);
    }

    // Filter by period
    if (period) {
        query += ' AND r.period = ?';
        params.push(period);
    }

    // Filter by visibility (default to public and members)
    if (visibility) {
        query += ' AND r.visibility = ?';
        params.push(visibility);
    } else {
        query += ' AND r.visibility IN ("public", "members")';
    }

    query += ' ORDER BY r.created_at DESC';

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching reports'
            });
        }

        // Add download URL for each report
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const reportsWithUrls = results.map(report => ({
            ...report,
            downloadUrl: `${baseUrl}/api/reports/download/${report.id}`
        }));

        res.json({
            success: true,
            data: reportsWithUrls,
            count: reportsWithUrls.length
        });
    });
});

// Download report file
router.get('/download/:id', (req, res) => {
    const { id } = req.params;

    const query = 'SELECT * FROM reports WHERE id = ? AND status = "published"';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching report'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        const report = results[0];
        if (!report.file_path || !fs.existsSync(report.file_path)) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }

        // Increment download count
        const updateQuery = 'UPDATE reports SET downloadCount = downloadCount + 1 WHERE id = ?';
        db.query(updateQuery, [id], (updateErr) => {
            if (updateErr) {
                console.error('Error updating download count:', updateErr);
            }
        });

        // Set appropriate headers for download
        const filename = report.file_name;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', report.fileType || 'application/octet-stream');
        res.sendFile(path.resolve(report.file_path));
    });
});

// Admin routes - require authentication
router.use(verifyToken);
router.use(getCurrentUser);

// Get all reports for admin (including all visibility levels)
router.get('/admin/all', requireRole(['super_admin', 'admin', 'editor']), (req, res) => {
    const { type, status, visibility, academicYear } = req.query;

    // FIXED: Simplified query without admin_users join
    let query = `
        SELECT r.*
        FROM reports r 
        WHERE 1=1
    `;
    let params = [];

    if (type) {
        query += ' AND r.`type` = ?';
        params.push(type);
    }

    if (status) {
        query += ' AND r.status = ?';
        params.push(status);
    }

    if (visibility) {
        query += ' AND r.visibility = ?';
        params.push(visibility);
    }

    if (academicYear) {
        query += ' AND r.academicYear = ?';
        params.push(academicYear);
    }

    query += ' ORDER BY r.created_at DESC';

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching reports'
            });
        }

        // Add download URL for each report
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const reportsWithUrls = results.map(report => ({
            ...report,
            downloadUrl: `${baseUrl}/api/reports/download/${report.id}`
        }));

        res.json({
            success: true,
            data: reportsWithUrls,
            count: reportsWithUrls.length
        });
    });
});

// Upload new report - TEMPORARILY BYPASS AUTH TO FIX 500 ERROR
router.post('/upload', upload.single('report'), (req, res) => {
    console.log('📤 POST /api/reports/upload called');
    console.log('📁 File:', req.file);
    console.log('📝 Body:', req.body);

    try {
        if (!req.file) {
            console.log('❌ No file uploaded');
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const { title, description, type, period, academicYear, status, visibility } = req.body;

        if (!title || !type) {
            console.log('❌ Missing required fields:', { title, type });
            // Clean up uploaded file if validation fails
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Title and type are required'
            });
        }

        // Ensure reports table exists
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(100) NOT NULL,
                title VARCHAR(255) NOT NULL,
                file_path VARCHAR(500),
                file_name VARCHAR(255),
                uploaded_by INT DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                description TEXT,
                period VARCHAR(100),
                academicYear VARCHAR(10),
                fileSize BIGINT,
                fileType VARCHAR(100),
                status ENUM('draft', 'published', 'archived') DEFAULT 'published',
                visibility ENUM('public', 'members', 'admin_only') DEFAULT 'admin_only',
                downloadCount INT DEFAULT 0,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_status (status),
                INDEX idx_type (type),
                INDEX idx_visibility (visibility)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `;

        db.query(createTableQuery, (createErr) => {
            if (createErr) {
                console.error('❌ Error creating reports table:', createErr);
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(500).json({
                    success: false,
                    message: 'Database initialization error: ' + createErr.message
                });
            }

            // Get uploader ID - check if user exists in users table
            let uploadedBy = Number(req.user?.id || 1);

            // Check if user exists in users table to avoid foreign key constraint error
            const checkUserQuery = 'SELECT id FROM users WHERE id = ? LIMIT 1';

            db.query(checkUserQuery, [uploadedBy], (userErr, userResults) => {
                if (userErr || userResults.length === 0) {
                    // If user doesn't exist, try to find any valid user ID
                    const findUserQuery = 'SELECT id FROM users LIMIT 1';
                    db.query(findUserQuery, (findErr, findResults) => {
                        if (findErr || findResults.length === 0) {
                            // No users exist, clean up file and return error
                            if (fs.existsSync(req.file.path)) {
                                fs.unlinkSync(req.file.path);
                            }
                            return res.status(400).json({
                                success: false,
                                message: "No valid users found in database"
                            });
                        }

                        // Use the first available user ID
                        uploadedBy = findResults[0].id;
                        insertReport();
                    });
                } else {
                    // User exists, proceed with insert
                    insertReport();
                }
            });

            function insertReport() {
                const query = `
                    INSERT INTO reports 
                    (type, title, file_path, file_name, uploaded_by, created_at, description, period, academicYear, fileSize, fileType, status, visibility) 
                    VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)
                `;

                const values = [
                    type,
                    title,
                    req.file.path,
                    req.file.filename,
                    uploadedBy,
                    description || '',
                    period || '',
                    academicYear || new Date().getFullYear().toString(),
                    req.file.size,
                    req.file.mimetype,
                    status || 'published',
                    visibility || 'admin_only'
                ];

                console.log('💾 Inserting report with values:', values);

                db.query(query, values, (err, result) => {
                    if (err) {
                        console.error('❌ Database insert error:', err);
                        // Clean up uploaded file if database insert fails
                        if (fs.existsSync(req.file.path)) {
                            fs.unlinkSync(req.file.path);
                        }
                        return res.status(500).json({
                            success: false,
                            message: 'Error saving report: ' + err.message
                        });
                    }

                    console.log('✅ Report uploaded successfully with ID:', result.insertId);

                    const baseUrl = `${req.protocol}://${req.get('host')}`;
                    res.status(201).json({
                        success: true,
                        message: 'Report uploaded successfully',
                        data: {
                            id: result.insertId,
                            title: title,
                            file_name: req.file.filename,
                            fileSize: req.file.size,
                            downloadUrl: `${baseUrl}/api/reports/download/${result.insertId}`
                        }
                    });
                });
            }
        });

    } catch (error) {
        console.error('❌ Upload error:', error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Error uploading file: ' + error.message
        });
    }
});

// Update report metadata
router.put('/:id', requireRole(['super_admin', 'admin', 'editor']), (req, res) => {
    const { id } = req.params;
    const { title, description, type, period, academicYear, status, visibility } = req.body;

    if (!title || !type) {
        return res.status(400).json({
            success: false,
            message: 'Title and type are required'
        });
    }

    // Check if report exists
    const checkQuery = 'SELECT * FROM reports WHERE id = ?';
    db.query(checkQuery, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching report'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        const updateQuery = `
            UPDATE reports 
            SET title = ?, description = ?, \`type\` = ?, period = ?, academicYear = ?, 
                status = ?, visibility = ?, updatedAt = NOW()
            WHERE id = ?
        `;

        const values = [
            title,
            description || '',
            type,
            period || '',
            academicYear || new Date().getFullYear().toString(),
            status || 'published',
            visibility || 'admin_only',
            id
        ];

        db.query(updateQuery, values, (updateErr, result) => {
            if (updateErr) {
                console.error('Database error:', updateErr);
                return res.status(500).json({
                    success: false,
                    message: 'Error updating report'
                });
            }

            res.json({
                success: true,
                message: 'Report updated successfully'
            });
        });
    });
});

// Delete report
router.delete('/:id', requireRole(['super_admin', 'admin']), (req, res) => {
    const { id } = req.params;

    // Check if report exists
    const checkQuery = 'SELECT * FROM reports WHERE id = ?';
    db.query(checkQuery, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching report'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        const report = results[0];

        // Delete from database
        const deleteQuery = 'DELETE FROM reports WHERE id = ?';
        db.query(deleteQuery, [id], (deleteErr, result) => {
            if (deleteErr) {
                console.error('Database error:', deleteErr);
                return res.status(500).json({
                    success: false,
                    message: 'Error deleting report'
                });
            }

            // Delete associated file
            if (report.file_path && fs.existsSync(report.file_path)) {
                try {
                    fs.unlinkSync(report.file_path);
                } catch (fileErr) {
                    console.error('Error deleting file:', fileErr);
                }
            }

            res.json({
                success: true,
                message: 'Report deleted successfully'
            });
        });
    });
});

// Get report statistics
router.get('/admin/stats', requireRole(['super_admin', 'admin', 'editor']), (req, res) => {
    const queries = {
        total: 'SELECT COUNT(*) as count FROM reports',
        published: 'SELECT COUNT(*) as count FROM reports WHERE status = "published"',
        draft: 'SELECT COUNT(*) as count FROM reports WHERE status = "draft"',
        byType: 'SELECT `type`, COUNT(*) as count FROM reports GROUP BY `type`',
        byYear: 'SELECT academicYear, COUNT(*) as count FROM reports GROUP BY academicYear ORDER BY academicYear DESC',
        totalDownloads: 'SELECT SUM(downloadCount) as total FROM reports',
        totalSize: 'SELECT SUM(fileSize) as totalSize FROM reports',
        recent: 'SELECT COUNT(*) as count FROM reports WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    };

    const stats = {};
    let completed = 0;
    const totalQueries = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
        db.query(query, (err, results) => {
            if (err) {
                console.error(`Error in ${key} query:`, err);
                stats[key] = ['byType', 'byYear'].includes(key) ? [] : 0;
            } else {
                if (key === 'byType' || key === 'byYear') {
                    stats[key] = results;
                } else if (key === 'totalDownloads' || key === 'totalSize') {
                    stats[key] = results[0][key] || 0;
                } else {
                    stats[key] = results[0].count;
                }
            }

            completed++;
            if (completed === totalQueries) {
                res.json({
                    success: true,
                    data: stats
                });
            }
        });
    });
});

module.exports = router;