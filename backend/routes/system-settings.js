const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole, getCurrentUser } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory for logos if it doesn't exist
const logoDir = path.join(__dirname, '../uploads/logo');
if (!fs.existsSync(logoDir)) {
    fs.mkdirSync(logoDir, { recursive: true });
}

// Configure multer for logo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, logoDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `logo_${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit for logos
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, JPG, PNG, GIF, SVG) are allowed for logos!'));
        }
    }
});

// Public endpoint to get public settings
router.get('/public', (req, res) => {
    const query = 'SELECT setting_key, setting_value, setting_type FROM system_settings WHERE is_public = TRUE';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching public settings'
            });
        }

        const settings = {};
        results.forEach(setting => {
            let value = setting.setting_value;

            // Parse based on type
            switch (setting.setting_type) {
                case 'boolean':
                    value = value === 'true';
                    break;
                case 'number':
                    value = parseFloat(value);
                    break;
                case 'json':
                    try {
                        value = JSON.parse(value);
                    } catch (e) {
                        console.error('Error parsing JSON setting:', setting.setting_key);
                    }
                    break;
            }

            settings[setting.setting_key] = value;
        });

        res.json({
            success: true,
            data: settings
        });
    });
});

// Admin routes - require authentication
router.use(verifyToken);
router.use(getCurrentUser);

// Get all system settings (admin only)
router.get('/all', requireRole(['super_admin', 'admin']), (req, res) => {
    const { category } = req.query;

    let query = 'SELECT * FROM system_settings';
    let params = [];

    if (category) {
        query += ' WHERE category = ?';
        params.push(category);
    }

    query += ' ORDER BY category, setting_key';

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching settings'
            });
        }

        // Parse values based on type
        const settings = results.map(setting => ({
            ...setting,
            parsed_value: parseSettingValue(setting.setting_value, setting.setting_type)
        }));

        res.json({
            success: true,
            data: settings
        });
    });
});

// Get feature flags
router.get('/features', requireRole(['super_admin', 'admin']), (req, res) => {
    const { category } = req.query;

    let query = 'SELECT * FROM feature_flags';
    let params = [];

    if (category) {
        query += ' WHERE category = ?';
        params.push(category);
    }

    query += ' ORDER BY category, feature_name';

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching feature flags'
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
});

// Update system setting
router.put('/setting/:key', requireRole(['super_admin', 'admin']), (req, res) => {
    const { key } = req.params;
    const { value, description } = req.body;

    if (value === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Setting value is required'
        });
    }

    // Convert value to string for storage
    let stringValue = value;
    if (typeof value === 'object') {
        stringValue = JSON.stringify(value);
    } else if (typeof value === 'boolean') {
        stringValue = value.toString();
    }

    let query = 'UPDATE system_settings SET setting_value = ?, updated_at = NOW()';
    let params = [stringValue];

    if (description) {
        query += ', description = ?';
        params.push(description);
    }

    query += ' WHERE setting_key = ?';
    params.push(key);

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error updating setting'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Setting not found'
            });
        }

        res.json({
            success: true,
            message: 'Setting updated successfully'
        });
    });
});

// Create new system setting
router.post('/setting', requireRole(['super_admin']), (req, res) => {
    const { setting_key, setting_value, setting_type, category, description, is_public } = req.body;

    if (!setting_key || setting_value === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Setting key and value are required'
        });
    }

    // Convert value to string for storage
    let stringValue = setting_value;
    if (typeof setting_value === 'object') {
        stringValue = JSON.stringify(setting_value);
    } else if (typeof setting_value === 'boolean') {
        stringValue = setting_value.toString();
    }

    const query = `
        INSERT INTO system_settings 
        (setting_key, setting_value, setting_type, category, description, is_public) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
        setting_key,
        stringValue,
        setting_type || 'text',
        category || 'general',
        description || '',
        is_public || false
    ];

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'Setting key already exists'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Error creating setting'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Setting created successfully',
            data: { id: result.insertId }
        });
    });
});

// Update feature flag
router.put('/feature/:key', requireRole(['super_admin', 'admin']), (req, res) => {
    const { key } = req.params;
    const { is_enabled, description } = req.body;

    if (is_enabled === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Feature enabled status is required'
        });
    }

    let query = 'UPDATE feature_flags SET is_enabled = ?, updated_at = NOW()';
    let params = [is_enabled];

    if (description) {
        query += ', description = ?';
        params.push(description);
    }

    query += ' WHERE feature_key = ?';
    params.push(key);

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error updating feature flag'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Feature flag not found'
            });
        }

        res.json({
            success: true,
            message: 'Feature flag updated successfully'
        });
    });
});

// Upload club logo
router.post('/upload-logo', requireRole(['super_admin', 'admin']), upload.single('logo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No logo file uploaded'
            });
        }

        const logoPath = `/uploads/logo/${req.file.filename}`;

        // Update the club_logo setting
        const query = 'UPDATE system_settings SET setting_value = ?, updated_at = NOW() WHERE setting_key = "club_logo"';

        db.query(query, [logoPath], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                // Clean up uploaded file if database update fails
                fs.unlinkSync(req.file.path);
                return res.status(500).json({
                    success: false,
                    message: 'Error updating logo setting'
                });
            }

            const baseUrl = `${req.protocol}://${req.get('host')}`;
            res.json({
                success: true,
                message: 'Logo uploaded successfully',
                data: {
                    logoPath: logoPath,
                    logoUrl: `${baseUrl}${logoPath}`
                }
            });
        });

    } catch (error) {
        console.error('Upload error:', error);
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Error uploading logo'
        });
    }
});

// Get system statistics
router.get('/stats', requireRole(['super_admin', 'admin']), (req, res) => {
    const queries = {
        totalSettings: 'SELECT COUNT(*) as count FROM system_settings',
        publicSettings: 'SELECT COUNT(*) as count FROM system_settings WHERE is_public = TRUE',
        totalFeatures: 'SELECT COUNT(*) as count FROM feature_flags',
        enabledFeatures: 'SELECT COUNT(*) as count FROM feature_flags WHERE is_enabled = TRUE',
        settingsByCategory: 'SELECT category, COUNT(*) as count FROM system_settings GROUP BY category',
        featuresByCategory: 'SELECT category, COUNT(*) as count FROM feature_flags GROUP BY category'
    };

    const stats = {};
    let completed = 0;
    const totalQueries = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
        db.query(query, (err, results) => {
            if (err) {
                console.error(`Error in ${key} query:`, err);
                stats[key] = ['settingsByCategory', 'featuresByCategory'].includes(key) ? [] : 0;
            } else {
                if (key === 'settingsByCategory' || key === 'featuresByCategory') {
                    stats[key] = results;
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

// Helper function to parse setting values
function parseSettingValue(value, type) {
    switch (type) {
        case 'boolean':
            return value === 'true';
        case 'number':
            return parseFloat(value);
        case 'json':
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        default:
            return value;
    }
}

module.exports = router;