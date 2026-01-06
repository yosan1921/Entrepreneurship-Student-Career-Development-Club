const express = require('express');
const router = express.Router();
const db = require('../db');

// Function to ensure news table exists
const ensureNewsTable = () => {
    return new Promise((resolve, reject) => {
        // Check if table exists first
        const checkTableQuery = `
            SELECT COUNT(*) as tableExists 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() AND table_name = 'news'
        `;

        db.query(checkTableQuery, (err, results) => {
            if (err) {
                console.error('Error checking news table:', err);
                reject(err);
                return;
            }

            const tableExists = results[0].tableExists > 0;
            if (tableExists) {
                console.log('✅ News table exists');
                resolve();
                return;
            }

            console.log('📋 Creating news table...');
            // Create table if it doesn't exist
            const createTableSQL = `
                CREATE TABLE news (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL,
                    category VARCHAR(100) DEFAULT 'General',
                    status ENUM('published', 'draft') DEFAULT 'published',
                    publishDate DATE,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    
                    INDEX idx_status (status),
                    INDEX idx_category (category),
                    INDEX idx_publishDate (publishDate)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `;

            db.query(createTableSQL, (err) => {
                if (err) {
                    console.error('Error creating news table:', err);
                    reject(err);
                } else {
                    console.log('✅ News table created successfully');

                    // Insert sample data
                    const sampleData = [
                        ['Welcome to ESCDC', 'We are excited to announce the launch of our new website and management system.', 'Announcements', 'published', '2025-01-04'],
                        ['Upcoming Events', 'Check out our exciting lineup of workshops and seminars for this semester.', 'Events', 'published', '2025-01-04'],
                        ['New Partnership', 'We have partnered with leading tech companies to provide better opportunities.', 'General', 'published', '2025-01-03']
                    ];

                    const insertQuery = 'INSERT INTO news (title, content, category, status, publishDate) VALUES ?';

                    db.query(insertQuery, [sampleData], (insertErr) => {
                        if (insertErr) {
                            console.error('Error inserting sample news:', insertErr);
                        } else {
                            console.log('✅ Sample news inserted');
                        }
                        resolve();
                    });
                }
            });
        });
    });
};

// Get all news (public)
router.get('/', async (req, res) => {
    console.log('📰 GET /api/news called');

    try {
        await ensureNewsTable();

        const { category, status = 'published', limit = 50, offset = 0 } = req.query;
        let query = 'SELECT * FROM news WHERE status = ?';
        let params = [status];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        query += ' ORDER BY publishDate DESC, createdAt DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        console.log('📰 Query:', query);
        console.log('📰 Params:', params);

        db.query(query, params, (err, results) => {
            if (err) {
                console.error('News DB Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching news',
                    error: err.message
                });
            }

            console.log(`✅ News found: ${results.length}`);

            res.json({
                success: true,
                count: results.length,
                news: results
            });
        });
    } catch (error) {
        console.error('News table initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

// Get all news for admin (including drafts)
router.get('/admin', async (req, res) => {
    console.log('📰 GET /api/news/admin called');

    try {
        await ensureNewsTable();

        const { category, status, limit = 50, offset = 0 } = req.query;
        let query = 'SELECT * FROM news WHERE 1=1';
        let params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        console.log('📰 Admin Query:', query);
        console.log('📰 Admin Params:', params);

        db.query(query, params, (err, results) => {
            if (err) {
                console.error('Admin News DB Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching news',
                    error: err.message
                });
            }

            console.log(`✅ Admin news found: ${results.length}`);

            res.json({
                success: true,
                count: results.length,
                news: results
            });
        });
    } catch (error) {
        console.error('Admin news table initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

// Create news
router.post('/', async (req, res) => {
    console.log('📰 POST /api/news called');

    try {
        await ensureNewsTable();

        const { title, content, category, status, publishDate } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        const query = 'INSERT INTO news (title, content, category, status, publishDate) VALUES (?, ?, ?, ?, ?)';
        const params = [
            title,
            content,
            category || 'General',
            status || 'published',
            publishDate || new Date().toISOString().split('T')[0]
        ];

        console.log('📰 Create Query:', query);
        console.log('📰 Create Params:', params);

        db.query(query, params, (err, result) => {
            if (err) {
                console.error('Create News DB Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error creating news',
                    error: err.message
                });
            }

            console.log('✅ News created with ID:', result.insertId);

            res.status(201).json({
                success: true,
                message: 'News created successfully',
                id: result.insertId
            });
        });
    } catch (error) {
        console.error('Create news table initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

// Update news
router.put('/:id', async (req, res) => {
    console.log('📰 PUT /api/news/:id called');

    try {
        await ensureNewsTable();

        const { id } = req.params;
        const { title, content, category, status, publishDate } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        const query = 'UPDATE news SET title = ?, content = ?, category = ?, status = ?, publishDate = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?';
        const params = [title, content, category, status, publishDate, id];

        console.log('📰 Update Query:', query);
        console.log('📰 Update Params:', params);

        db.query(query, params, (err, result) => {
            if (err) {
                console.error('Update News DB Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error updating news',
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'News not found'
                });
            }

            console.log('✅ News updated, affected rows:', result.affectedRows);

            res.json({
                success: true,
                message: 'News updated successfully'
            });
        });
    } catch (error) {
        console.error('Update news table initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

// Delete news
router.delete('/:id', async (req, res) => {
    console.log('📰 DELETE /api/news/:id called');

    try {
        await ensureNewsTable();

        const { id } = req.params;
        const query = 'DELETE FROM news WHERE id = ?';

        console.log('📰 Delete Query:', query, 'ID:', id);

        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Delete News DB Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error deleting news',
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'News not found'
                });
            }

            console.log('✅ News deleted, affected rows:', result.affectedRows);

            res.json({
                success: true,
                message: 'News deleted successfully'
            });
        });
    } catch (error) {
        console.error('Delete news table initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

module.exports = router;