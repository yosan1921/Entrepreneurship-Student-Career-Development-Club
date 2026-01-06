const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const db = require('../db');
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
router.get('/', (req, res) => {
    console.log('📚 GET /api/resources called');

    const { category, type, search, featured, limit = 50, offset = 0 } = req.query;

    let query = `
        SELECT r.*, COALESCE(rc.name, 'Uncategorized') as category_name
        FROM resources r
        LEFT JOIN resource_categories rc ON r.category_id = rc.id
        WHERE r.status = 'Active'
    `;

    const params = [];

    if (category) {
        query += ' AND rc.name = ?';
        params.push(category);
    }

    if (type) {
        query += ' AND r.type = ?';
        params.push(type);
    }

    if (search) {
        query += ' AND (r.title LIKE ? OR r.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    if (featured === 'true') {
        query += ' AND r.featured = 1';
    }

    query += ' ORDER BY r.pinned DESC, r.featured DESC, r.uploaded_at DESC';
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    console.log('📚 Executing query:', query);
    console.log('📚 With params:', params);

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('❌ Database error in GET /api/resources:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching resources',
                error: err.message
            });
        }

        console.log(`✅ GET /api/resources successful: ${results.length} resources found`);

        res.json({
            success: true,
            resources: results,
            total: results.length
        });
    });
});

// Get categories
router.get('/categories', (req, res) => {
    console.log('📂 GET /api/resources/categories/all called');

    const query = 'SELECT * FROM resource_categories ORDER BY name';

    console.log('📂 Executing query:', query);

    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Database error in GET /api/resources/categories/all:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching categories',
                error: err.message
            });
        }

        console.log(`✅ GET /api/resources/categories/all successful: ${results.length} categories found`);

        res.json({
            success: true,
            categories: results
        });
    });
});

// Get tags (placeholder - table doesn't exist yet)
router.get('/tags', (req, res) => {
    console.log('🏷️ GET /api/resources/tags called');

    // Return empty array since resource_tags table doesn't exist yet
    res.json({
        success: true,
        tags: []
    });
});

// Debug endpoint to check table structure
router.get('/debug/table', (req, res) => {
    console.log('🔍 GET /api/resources/debug/table called');

    const query = 'DESCRIBE resources';
    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Error describing table:', err);
            return res.status(500).json({
                success: false,
                message: 'Error checking table structure',
                error: err.message
            });
        }

        console.log('📋 Resources table structure:', results);
        res.json({
            success: true,
            structure: results
        });
    });
});

// Create resource (public endpoint for testing)
router.post('/', upload.single('file'), (req, res) => {
    console.log('📝 POST /api/resources called');
    console.log('📝 Request body:', req.body);
    console.log('📝 File:', req.file);
    console.log('📝 Content-Type:', req.headers['content-type']);

    const { title, description, category_id, file_url, type, featured, pinned, status } = req.body;

    // Validate required fields
    if (!title || title.trim() === '') {
        console.log('❌ Validation failed: Title is required');
        return res.status(400).json({
            success: false,
            message: 'Title is required'
        });
    }

    // First, let's check if the resources table exists
    const checkTableQuery = 'SHOW TABLES LIKE "resources"';
    db.query(checkTableQuery, (err, results) => {
        if (err) {
            console.error('❌ Error checking table existence:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error checking table',
                error: err.message
            });
        }

        if (results.length === 0) {
            console.log('❌ Resources table does not exist');
            return res.status(500).json({
                success: false,
                message: 'Resources table does not exist. Please run database setup.'
            });
        }

        // Determine resource type and file path
        let resourceType = type || 'link'; // Default to 'link' if no type specified
        let filePath = null;

        if (req.file) {
            // File was uploaded
            resourceType = 'file';
            filePath = req.file.filename;
            console.log('📁 File uploaded:', filePath);
        } else if (file_url && file_url.trim() !== '') {
            // URL was provided
            resourceType = 'link';
            filePath = file_url.trim();
            console.log('🔗 URL provided:', filePath);
        } else if (type === 'file') {
            // Explicitly requested file type but no file uploaded
            console.log('❌ Validation failed: File required for file type');
            return res.status(400).json({
                success: false,
                message: 'File is required for file-type resources'
            });
        } else {
            // No file or URL provided, use empty string instead of null
            filePath = '';
            console.log('📝 No file or URL provided, using empty string');
        }

        const resourceData = {
            title: title.trim(),
            description: description ? description.trim() : '',
            category_id: category_id ? parseInt(category_id) : null,
            type: resourceType,
            file_path: filePath,
            status: status || 'Active',
            featured: featured === 'true' || featured === true ? 1 : 0,
            pinned: pinned === 'true' || pinned === true ? 1 : 0,
            created_by: null // No auth for testing
        };

        console.log('📝 Resource data to insert:', resourceData);

        // Use a simpler insert query to avoid column issues
        const query = `
            INSERT INTO resources (title, description, type, file_path, status, featured, pinned)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            resourceData.title,
            resourceData.description,
            resourceData.type,
            resourceData.file_path,
            resourceData.status,
            resourceData.featured,
            resourceData.pinned
        ];

        console.log('📝 Executing insert query:', query);
        console.log('📝 With params:', params);

        db.query(query, params, (err, result) => {
            if (err) {
                console.error('❌ Database error in POST /api/resources:', err);
                console.error('❌ SQL State:', err.sqlState);
                console.error('❌ Error Code:', err.code);
                return res.status(500).json({
                    success: false,
                    message: 'Error creating resource',
                    error: err.message,
                    sqlState: err.sqlState,
                    code: err.code
                });
            }

            console.log('✅ Resource created successfully with ID:', result.insertId);

            res.json({
                success: true,
                message: 'Resource created successfully',
                resource: {
                    id: result.insertId,
                    ...resourceData
                }
            });
        });
    });
});

// ================== ADMIN ROUTES ==================

// Apply authentication to admin routes (temporarily disabled for testing)
// router.use('/admin/*', verifyToken);
// router.use('/admin/*', getCurrentUser);
// router.use('/admin/*', requireRole(['super_admin', 'admin', 'editor']));

// Get all resources (admin)
router.get('/admin', (req, res) => {
    console.log('🔧 GET /api/resources/admin/all called');

    const { category, status, search, limit = 100, offset = 0 } = req.query;

    let query = `
        SELECT r.*, 
               COALESCE(rc.name, 'Uncategorized') as category_name,
               COALESCE(CONCAT(au_created.firstName, ' ', au_created.lastName), 'System') as created_by_name,
               COALESCE(CONCAT(au_updated.firstName, ' ', au_updated.lastName), 'System') as updated_by_name
        FROM resources r
        LEFT JOIN resource_categories rc ON r.category_id = rc.id
        LEFT JOIN admin_users au_created ON r.created_by = au_created.id
        LEFT JOIN admin_users au_updated ON r.updated_by = au_updated.id
        WHERE 1=1
    `;

    const params = [];

    if (category) {
        query += ' AND rc.name = ?';
        params.push(category);
    }

    if (status) {
        query += ' AND r.status = ?';
        params.push(status);
    }

    if (search) {
        query += ' AND (r.title LIKE ? OR r.description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY r.pinned DESC, r.featured DESC, r.uploaded_at DESC';
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    console.log('🔧 Executing query:', query);
    console.log('🔧 With params:', params);

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('❌ Database error in GET /api/resources/admin/all:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching resources',
                error: err.message
            });
        }

        console.log(`✅ GET /api/resources/admin/all successful: ${results.length} resources found`);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM resources r LEFT JOIN resource_categories rc ON r.category_id = rc.id WHERE 1=1';
        const countParams = [];

        if (category) {
            countQuery += ' AND rc.name = ?';
            countParams.push(category);
        }

        if (status) {
            countQuery += ' AND r.status = ?';
            countParams.push(status);
        }

        if (search) {
            countQuery += ' AND (r.title LIKE ? OR r.description LIKE ?)';
            countParams.push(`%${search}%`, `%${search}%`);
        }

        db.query(countQuery, countParams, (countErr, countResults) => {
            if (countErr) {
                console.error('❌ Error getting count:', countErr);
                return res.status(500).json({
                    success: false,
                    message: 'Error getting resource count'
                });
            }

            res.json({
                success: true,
                resources: results,
                total: countResults[0].total,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: (parseInt(offset) + results.length) < countResults[0].total
                }
            });
        });
    });
});

// Create resource
router.post('/admin', upload.single('file'), (req, res) => {
    console.log('📝 POST /api/resources/admin called');
    console.log('📝 Request body:', req.body);
    console.log('📝 File:', req.file);
    console.log('📝 Content-Type:', req.headers['content-type']);

    const { title, description, category_id, file_url, type, featured, pinned, status } = req.body;

    // Validate required fields
    if (!title || title.trim() === '') {
        console.log('❌ Validation failed: Title is required');
        return res.status(400).json({
            success: false,
            message: 'Title is required'
        });
    }

    // Determine resource type and file path
    let resourceType = type || 'link'; // Default to 'link' if no type specified
    let filePath = null;

    if (req.file) {
        // File was uploaded
        resourceType = 'file';
        filePath = req.file.filename;
        console.log('📁 File uploaded:', filePath);
    } else if (file_url && file_url.trim() !== '') {
        // URL was provided
        resourceType = 'link';
        filePath = file_url.trim();
        console.log('🔗 URL provided:', filePath);
    } else if (type === 'file') {
        // Explicitly requested file type but no file uploaded
        console.log('❌ Validation failed: File required for file type');
        return res.status(400).json({
            success: false,
            message: 'File is required for file-type resources'
        });
    } else {
        // No file or URL provided, use empty string instead of null
        filePath = '';
        console.log('📝 No file or URL provided, using empty string');
    }

    const resourceData = {
        title: title.trim(),
        description: description ? description.trim() : '',
        category_id: category_id ? parseInt(category_id) : null,
        type: resourceType,
        file_path: filePath,
        status: status || 'Active',
        featured: featured === 'true' || featured === true ? 1 : 0,
        pinned: pinned === 'true' || pinned === true ? 1 : 0,
        created_by: req.user ? req.user.id : null
    };

    console.log('📝 Resource data to insert:', resourceData);

    const query = `
        INSERT INTO resources (title, description, category_id, type, file_path, status, featured, pinned, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        resourceData.title,
        resourceData.description,
        resourceData.category_id,
        resourceData.type,
        resourceData.file_path,
        resourceData.status,
        resourceData.featured,
        resourceData.pinned,
        resourceData.created_by
    ];

    console.log('📝 Executing insert query:', query);
    console.log('📝 With params:', params);

    db.query(query, params, (err, result) => {
        if (err) {
            console.error('❌ Database error in POST /api/resources/admin:', err);
            return res.status(500).json({
                success: false,
                message: 'Error creating resource',
                error: err.message
            });
        }

        console.log('✅ Resource created successfully with ID:', result.insertId);

        res.json({
            success: true,
            message: 'Resource created successfully',
            resource: {
                id: result.insertId,
                ...resourceData
            }
        });
    });
});

// Delete resource
router.delete('/:id', (req, res) => {
    console.log('🗑️ DELETE /api/resources/:id called');

    const resourceId = req.params.id;
    console.log('🗑️ Resource ID:', resourceId);

    if (!resourceId) {
        return res.status(400).json({
            success: false,
            message: 'Resource ID is required'
        });
    }

    // First get the resource to check if it has a file to delete
    const selectQuery = 'SELECT * FROM resources WHERE id = ?';

    db.query(selectQuery, [resourceId], (err, results) => {
        if (err) {
            console.error('❌ Database error in DELETE /api/resources/:id (select):', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching resource',
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        const resource = results[0];

        // Delete the database record
        const deleteQuery = 'DELETE FROM resources WHERE id = ?';

        db.query(deleteQuery, [resourceId], (deleteErr, deleteResult) => {
            if (deleteErr) {
                console.error('❌ Database error in DELETE /api/resources/:id (delete):', deleteErr);
                return res.status(500).json({
                    success: false,
                    message: 'Error deleting resource',
                    error: deleteErr.message
                });
            }

            if (deleteResult.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }

            // If it's a file resource, try to delete the physical file
            if (resource.type === 'file' && resource.file_path) {
                const fs = require('fs');
                const path = require('path');
                const filePath = path.join(__dirname, '../uploads/resources', resource.file_path);

                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log('🗑️ Physical file deleted:', filePath);
                    }
                } catch (fileErr) {
                    console.error('⚠️ Warning: Could not delete physical file:', fileErr.message);
                    // Don't fail the request if file deletion fails
                }
            }

            console.log('✅ Resource deleted successfully');

            res.json({
                success: true,
                message: 'Resource deleted successfully'
            });
        });
    });
});

// Get categories for admin (same as public but with different endpoint)
router.get('/admin/categories', (req, res) => {
    console.log('📂 GET /api/resources/admin/categories called');

    const query = 'SELECT * FROM resource_categories ORDER BY name';

    db.query(query, (err, results) => {
        if (err) {
            console.error('❌ Database error in GET /api/resources/admin/categories:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching categories',
                error: err.message
            });
        }

        console.log(`✅ GET /api/resources/admin/categories successful: ${results.length} categories found`);

        res.json({
            success: true,
            categories: results
        });
    });
});

// Get stats endpoint
router.get('/stats', (req, res) => {
    console.log('📊 GET /api/resources/stats called');

    const statsQuery = `
        SELECT 
            COUNT(*) as total_resources,
            COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_resources,
            COUNT(CASE WHEN featured = 1 THEN 1 END) as featured_resources,
            SUM(COALESCE(download_count, 0)) as total_downloads,
            COUNT(CASE WHEN type = 'file' THEN 1 END) as file_resources,
            COUNT(CASE WHEN type = 'link' THEN 1 END) as link_resources
        FROM resources
    `;

    console.log('📊 Executing stats query:', statsQuery);

    db.query(statsQuery, (err, results) => {
        if (err) {
            console.error('❌ Database error in GET /api/resources/stats:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching stats',
                error: err.message
            });
        }

        console.log('✅ Stats retrieved:', results[0]);

        res.json({
            success: true,
            stats: results[0] || {
                total_resources: 0,
                active_resources: 0,
                featured_resources: 0,
                total_downloads: 0,
                file_resources: 0,
                link_resources: 0
            }
        });
    });
});

// Download resource file (GET method)
router.get('/:id/download', (req, res) => {
    console.log('📥 GET /api/resources/:id/download called');
    handleResourceDownload(req, res);
});

// Download resource file (POST method for frontend compatibility)
router.post('/:id/download', (req, res) => {
    console.log('📥 POST /api/resources/:id/download called');
    handleResourceDownload(req, res);
});

// Shared download handler function
function handleResourceDownload(req, res) {
    const resourceId = req.params.id;
    console.log('📥 Resource ID:', resourceId);

    if (!resourceId) {
        return res.status(400).json({
            success: false,
            message: 'Resource ID is required'
        });
    }

    const query = 'SELECT * FROM resources WHERE id = ? AND status = "Active"';

    db.query(query, [resourceId], (err, results) => {
        if (err) {
            console.error('❌ Database error in download:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error',
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        const resource = results[0];
        console.log('📥 Resource found:', resource.title, 'Type:', resource.type);

        // Handle different resource types
        if (resource.type === 'link') {
            // For link resources, return the URL
            return res.json({
                success: true,
                message: 'Link resource',
                downloadUrl: resource.file_path,
                type: 'link'
            });
        }

        if (resource.type !== 'file') {
            return res.status(400).json({
                success: false,
                message: 'Resource is not downloadable'
            });
        }

        if (!resource.file_path) {
            return res.status(400).json({
                success: false,
                message: 'No file path available'
            });
        }

        const fs = require('fs');
        const path = require('path');
        const fullPath = path.join(__dirname, '../uploads/resources', resource.file_path);

        console.log('📥 Looking for file at:', fullPath);

        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            console.error('❌ File not found at:', fullPath);
            return res.status(404).json({
                success: false,
                message: 'File not found on server'
            });
        }

        try {
            // Get file stats
            const stats = fs.statSync(fullPath);

            if (!stats.isFile()) {
                return res.status(400).json({
                    success: false,
                    message: 'Path does not point to a valid file'
                });
            }

            // Update download count
            const updateQuery = 'UPDATE resources SET download_count = COALESCE(download_count, 0) + 1 WHERE id = ?';
            db.query(updateQuery, [resourceId], (updateErr) => {
                if (updateErr) {
                    console.error('⚠️ Error updating download count:', updateErr);
                }
            });

            // Set proper headers for download
            const fileName = resource.file_name || resource.file_path;
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Type', resource.file_type || 'application/octet-stream');
            res.setHeader('Content-Length', stats.size);

            console.log('📥 Starting file download:', fileName);

            // Stream the file
            const fileStream = fs.createReadStream(fullPath);
            fileStream.pipe(res);

            fileStream.on('error', (streamError) => {
                console.error('❌ File stream error:', streamError);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error streaming file'
                    });
                }
            });

            fileStream.on('end', () => {
                console.log('✅ File download completed:', fileName);
            });

        } catch (statError) {
            console.error('❌ File stat error:', statError);
            return res.status(500).json({
                success: false,
                message: 'Error accessing file'
            });
        }
    });
}

module.exports = router;