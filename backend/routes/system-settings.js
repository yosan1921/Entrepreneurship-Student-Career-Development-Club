const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
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
router.get('/public', async (req, res) => {
    try {
        const db = getDB();
        const results = await db.collection('system_settings')
            .find({ is_public: true })
            .toArray();

        const settings = {};
        results.forEach(setting => {
            let value = setting.setting_value;

            // Parse based on type
            switch (setting.setting_type) {
                case 'boolean':
                    value = value === 'true' || value === true;
                    break;
                case 'number':
                    value = parseFloat(value);
                    break;
                case 'json':
                    if (typeof value === 'string') {
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            console.error('Error parsing JSON setting:', setting.setting_key);
                        }
                    }
                    break;
            }

            settings[setting.setting_key] = value;
        });

        res.json({
            success: true,
            data: settings
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching public settings'
        });
    }
});

// Admin routes - require authentication
router.use(verifyToken);
router.use(getCurrentUser);

// Get all system settings (admin only)
router.get('/all', requireRole(['super_admin', 'admin']), async (req, res) => {
    try {
        const { category } = req.query;
        const db = getDB();

        let query = {};
        if (category) {
            query.category = category;
        }

        const results = await db.collection('system_settings')
            .find(query)
            .sort({ category: 1, setting_key: 1 })
            .toArray();
        // Parse values based on type
        const settings = results.map(setting => ({
            ...setting,
            parsed_value: parseSettingValue(setting.setting_value, setting.setting_type)
        }));

        res.json({
            success: true,
            data: settings
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching settings'
        });
    }
});

// Get feature flags
router.get('/features', requireRole(['super_admin', 'admin']), async (req, res) => {
    try {
        const { category } = req.query;
        const db = getDB();

        let query = {};
        if (category) {
            query.category = category;
        }

        const results = await db.collection('feature_flags')
            .find(query)
            .sort({ category: 1, feature_name: 1 })
            .toArray();

        res.json({
            success: true,
            data: results
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching feature flags'
        });
    }
});

// Update system setting
router.put('/setting/:key', requireRole(['super_admin', 'admin']), async (req, res) => {
    try {
        const { key } = req.params;
        const { value, description } = req.body;

        if (value === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Setting value is required'
            });
        }

        // Convert value to string for storage (consistent with MySQL version)
        let stringValue = value;
        if (typeof value === 'object') {
            stringValue = JSON.stringify(value);
        } else if (typeof value === 'boolean') {
            stringValue = value.toString();
        }

        const db = getDB();
        const updateData = {
            setting_value: stringValue,
            updated_at: new Date()
        };

        if (description) {
            updateData.description = description;
        }

        const result = await db.collection('system_settings').updateOne(
            { setting_key: key },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Setting not found'
            });
        }

        res.json({
            success: true,
            message: 'Setting updated successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error updating setting'
        });
    }
});

// Create new system setting
router.post('/setting', requireRole(['super_admin']), async (req, res) => {
    try {
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

        const db = getDB();

        // Check if key already exists
        const existing = await db.collection('system_settings').findOne({ setting_key });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Setting key already exists'
            });
        }

        const newSetting = {
            setting_key,
            setting_value: stringValue,
            setting_type: setting_type || 'text',
            category: category || 'general',
            description: description || '',
            is_public: is_public || false,
            created_at: new Date(),
            updated_at: new Date()
        };

        const result = await db.collection('system_settings').insertOne(newSetting);

        res.status(201).json({
            success: true,
            message: 'Setting created successfully',
            data: { id: result.insertedId }
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error creating setting'
        });
    }
});

// Update feature flag
router.put('/feature/:key', requireRole(['super_admin', 'admin']), async (req, res) => {
    try {
        const { key } = req.params;
        const { is_enabled, description } = req.body;

        if (is_enabled === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Feature enabled status is required'
            });
        }

        const db = getDB();
        const updateData = {
            is_enabled: is_enabled === true || is_enabled === 'true',
            updated_at: new Date()
        };

        if (description) {
            updateData.description = description;
        }

        const result = await db.collection('feature_flags').updateOne(
            { feature_key: key },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Feature flag not found'
            });
        }

        res.json({
            success: true,
            message: 'Feature flag updated successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error updating feature flag'
        });
    }
});

// Upload club logo
router.post('/upload-logo', requireRole(['super_admin', 'admin']), upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No logo file uploaded'
            });
        }

        const logoPath = `/uploads/logo/${req.file.filename}`;
        const db = getDB();

        // Update the club_logo setting
        const result = await db.collection('system_settings').updateOne(
            { setting_key: "club_logo" },
            {
                $set: {
                    setting_value: logoPath,
                    updated_at: new Date()
                }
            }
        );

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        res.json({
            success: true,
            message: 'Logo uploaded successfully',
            data: {
                logoPath: logoPath,
                logoUrl: `${baseUrl}${logoPath}`
            }
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
router.get('/stats', requireRole(['super_admin', 'admin']), async (req, res) => {
    try {
        const db = getDB();

        const [
            totalSettings,
            publicSettings,
            totalFeatures,
            enabledFeatures,
            settingsByCategory,
            featuresByCategory
        ] = await Promise.all([
            db.collection('system_settings').countDocuments({}),
            db.collection('system_settings').countDocuments({ is_public: true }),
            db.collection('feature_flags').countDocuments({}),
            db.collection('feature_flags').countDocuments({ is_enabled: true }),
            db.collection('system_settings').aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } }
            ]).toArray(),
            db.collection('feature_flags').aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } }
            ]).toArray()
        ]);

        const stats = {
            totalSettings,
            publicSettings,
            totalFeatures,
            enabledFeatures,
            settingsByCategory: settingsByCategory.map(item => ({ category: item._id, count: item.count })),
            featuresByCategory: featuresByCategory.map(item => ({ category: item._id, count: item.count }))
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching system statistics'
        });
    }
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