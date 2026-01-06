const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole, getCurrentUser } = require('../middleware/auth');

// Get all announcements (public endpoint)
router.get('/', (req, res) => {
    const { visibility, status, limit } = req.query;

    let query = 'SELECT a.*, au.username as createdByName FROM announcements a LEFT JOIN admin_users au ON a.created_by = au.id WHERE 1=1';
    let params = [];

    // Filter by visibility
    if (visibility) {
        query += ' AND a.visibility = ?';
        params.push(visibility);
    }

    // Filter by status (default to published for public)
    if (status) {
        query += ' AND a.status = ?';
        params.push(status);
    } else {
        query += ' AND a.status = "published"';
    }

    // Check expiry date
    query += ' AND (a.expiryDate IS NULL OR a.expiryDate > NOW())';

    // Order by priority and publish date
    query += ' ORDER BY FIELD(a.priority, "urgent", "high", "normal", "low"), a.publishDate DESC';

    // Limit results
    if (limit) {
        query += ' LIMIT ?';
        params.push(parseInt(limit));
    }

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching announcements'
            });
        }

        res.json({
            success: true,
            data: results,
            count: results.length
        });
    });
});

// Get single announcement (public)
router.get('/:id', (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT a.*, au.username as createdByName 
        FROM announcements a 
        LEFT JOIN admin_users au ON a.created_by = au.id 
        WHERE a.id = ? AND a.status = "published" 
        AND (a.expiryDate IS NULL OR a.expiryDate > NOW())
    `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching announcement'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    });
});

// Get all announcements for admin (including drafts and archived)
router.get('/admin/all', verifyToken, getCurrentUser, requireRole(['super_admin', 'admin', 'editor']), (req, res) => {
    const { status, visibility } = req.query;

    let query = `
        SELECT a.*, au.username as createdByName 
        FROM announcements a 
        LEFT JOIN admin_users au ON a.created_by = au.id 
        WHERE 1=1
    `;
    let params = [];

    if (status) {
        query += ' AND a.status = ?';
        params.push(status);
    }

    if (visibility) {
        query += ' AND a.visibility = ?';
        params.push(visibility);
    }

    query += ' ORDER BY a.created_at DESC';

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching announcements'
            });
        }

        res.json({
            success: true,
            data: results,
            count: results.length
        });
    });
});

// Create new announcement
router.post('/', verifyToken, getCurrentUser, requireRole(['super_admin', 'admin', 'editor']), (req, res) => {
    const { title, content, visibility, priority, status, publishDate, expiryDate } = req.body;

    if (!title || !content) {
        return res.status(400).json({
            success: false,
            message: 'Title and content are required'
        });
    }

    const query = `
        INSERT INTO announcements 
        (title, content, visibility, priority, status, publishDate, expiryDate, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        title,
        content,
        visibility || 'public',
        priority || 'normal',
        status || 'published',
        publishDate || new Date(),
        expiryDate || null,
        req.user.id
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error creating announcement'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            id: result.insertId
        });
    });
});

// Update announcement
router.put('/:id', verifyToken, getCurrentUser, requireRole(['super_admin', 'admin', 'editor']), (req, res) => {
    const { id } = req.params;
    const { title, content, visibility, priority, status, publishDate, expiryDate } = req.body;

    if (!title || !content) {
        return res.status(400).json({
            success: false,
            message: 'Title and content are required'
        });
    }

    // Check if announcement exists
    const checkQuery = 'SELECT * FROM announcements WHERE id = ?';
    db.query(checkQuery, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching announcement'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        const updateQuery = `
            UPDATE announcements 
            SET title = ?, content = ?, visibility = ?, priority = ?, status = ?, 
                publishDate = ?, expiryDate = ?, updated_at = NOW()
            WHERE id = ?
        `;

        const values = [
            title,
            content,
            visibility || 'public',
            priority || 'normal',
            status || 'published',
            publishDate || results[0].publishDate,
            expiryDate || null,
            id
        ];

        db.query(updateQuery, values, (updateErr, result) => {
            if (updateErr) {
                console.error('Database error:', updateErr);
                return res.status(500).json({
                    success: false,
                    message: 'Error updating announcement'
                });
            }

            res.json({
                success: true,
                message: 'Announcement updated successfully'
            });
        });
    });
});

// Delete announcement
router.delete('/:id', verifyToken, getCurrentUser, requireRole(['super_admin', 'admin']), (req, res) => {
    const { id } = req.params;

    // Check if announcement exists
    const checkQuery = 'SELECT * FROM announcements WHERE id = ?';
    db.query(checkQuery, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching announcement'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        const deleteQuery = 'DELETE FROM announcements WHERE id = ?';
        db.query(deleteQuery, [id], (deleteErr, result) => {
            if (deleteErr) {
                console.error('Database error:', deleteErr);
                return res.status(500).json({
                    success: false,
                    message: 'Error deleting announcement'
                });
            }

            res.json({
                success: true,
                message: 'Announcement deleted successfully'
            });
        });
    });
});

// Get announcement statistics
router.get('/admin/stats', verifyToken, getCurrentUser, requireRole(['super_admin', 'admin', 'editor']), (req, res) => {
    const queries = {
        total: 'SELECT COUNT(*) as count FROM announcements',
        published: 'SELECT COUNT(*) as count FROM announcements WHERE status = "published"',
        draft: 'SELECT COUNT(*) as count FROM announcements WHERE status = "draft"',
        archived: 'SELECT COUNT(*) as count FROM announcements WHERE status = "archived"',
        public: 'SELECT COUNT(*) as count FROM announcements WHERE visibility = "public"',
        members: 'SELECT COUNT(*) as count FROM announcements WHERE visibility = "members"',
        byPriority: 'SELECT priority, COUNT(*) as count FROM announcements GROUP BY priority',
        recent: 'SELECT COUNT(*) as count FROM announcements WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
    };

    const stats = {};
    let completed = 0;
    const totalQueries = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
        db.query(query, (err, results) => {
            if (err) {
                console.error(`Error in ${key} query:`, err);
                stats[key] = key === 'byPriority' ? [] : 0;
            } else {
                if (key === 'byPriority') {
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

module.exports = router;