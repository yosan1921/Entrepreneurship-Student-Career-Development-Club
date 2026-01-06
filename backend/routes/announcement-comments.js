const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all comments for an announcement (public)
router.get('/announcement/:announcementId', (req, res) => {
    const { announcementId } = req.params;

    const query = `
        SELECT * FROM announcement_comments 
        WHERE announcement_id = ? AND status = 'approved'
        ORDER BY created_at DESC
    `;

    db.query(query, [announcementId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching comments'
            });
        }

        res.json({
            success: true,
            data: results,
            count: results.length
        });
    });
});

// Add a new comment (supports authenticated users)
router.post('/', (req, res) => {
    const { announcement_id, comment_text } = req.body;
    const token = req.header('Authorization')?.replace('Bearer ', '');

    console.log('📝 Received comment submission:', { announcement_id, comment_text: comment_text?.substring(0, 50), hasToken: !!token });

    if (!announcement_id || !comment_text) {
        console.log('❌ Missing required fields');
        return res.status(400).json({
            success: false,
            message: 'Announcement ID and comment text are required'
        });
    }

    // Check if announcement exists
    const checkQuery = 'SELECT id FROM announcements WHERE id = ? AND status = "published"';
    db.query(checkQuery, [announcement_id], (err, results) => {
        if (err) {
            console.error('❌ Database error checking announcement:', err);
            return res.status(500).json({
                success: false,
                message: 'Error checking announcement: ' + err.message
            });
        }

        if (results.length === 0) {
            console.log('❌ Announcement not found or not published:', announcement_id);
            return res.status(404).json({
                success: false,
                message: 'Announcement not found or not published'
            });
        }

        console.log('✅ Announcement exists, processing comment...');

        // If token exists, use authenticated user
        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                // Get user details
                const getUserQuery = 'SELECT id, username, email, firstName, lastName FROM admin_users WHERE id = ?';
                db.query(getUserQuery, [decoded.id], (userErr, userResults) => {
                    if (userErr || userResults.length === 0) {
                        console.error('❌ Database error fetching user from admin_users:', userErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Error fetching user details'
                        });
                    }

                    const user = userResults[0];
                    const fullName = user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.username;

                    // Ensure the user id exists in the `users` table to satisfy any foreign key constraints
                    const checkUsersTableQuery = 'SELECT id FROM users WHERE id = ? LIMIT 1';
                    db.query(checkUsersTableQuery, [user.id], (checkErr, checkResults) => {
                        if (checkErr) {
                            console.error('❌ Error checking users table for user id:', checkErr);
                            return res.status(500).json({
                                success: false,
                                message: 'Error validating user for comment'
                            });
                        }

                        // If not found in users table, insert NULL for user_id to avoid FK failure
                        const userIdForInsert = (checkResults && checkResults.length > 0) ? user.id : null;

                        console.log('✅ Authenticated user, inserting comment (userIdForInsert=' + userIdForInsert + ')...');

                        const insertQuery = `
                            INSERT INTO announcement_comments 
                            (announcement_id, user_id, user_name, user_email, comment_text, status) 
                            VALUES (?, ?, ?, ?, ?, 'approved')
                        `;

                        db.query(insertQuery, [announcement_id, userIdForInsert, fullName, user.email, comment_text], (insertErr, result) => {
                        if (insertErr) {
                            console.error('❌ Database error inserting comment:', insertErr);

                            if (insertErr.code === 'ER_NO_SUCH_TABLE') {
                                return res.status(500).json({
                                    success: false,
                                    message: 'Comments table does not exist. Please run: node backend/setup-announcement-comments.js'
                                });
                            }

                            return res.status(500).json({
                                success: false,
                                message: 'Error adding comment: ' + insertErr.message
                            });
                        }

                        console.log('✅ Comment added successfully, ID:', result.insertId);

                        res.status(201).json({
                            success: true,
                            message: 'Comment added successfully',
                            data: {
                                id: result.insertId,
                                announcement_id,
                                user_id: userIdForInsert,
                                user_name: fullName,
                                user_email: user.email,
                                comment_text,
                                created_at: new Date()
                            }
                        });
                    });
                    });
                });
            } catch (error) {
                console.error('❌ Token verification error:', error);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid authentication token. Please log in.'
                });
            }
        } else {
            // No token - user must be authenticated
            console.log('❌ No authentication token provided');
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please log in to comment.'
            });
        }
    });
});

// Update a comment (user can edit their own comment)
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { comment_text } = req.body;
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!comment_text) {
        return res.status(400).json({
            success: false,
            message: 'Comment text is required'
        });
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please log in.'
        });
    }

    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if comment exists and belongs to the user
        const checkQuery = 'SELECT * FROM announcement_comments WHERE id = ? AND user_id = ?';
        db.query(checkQuery, [id, decoded.id], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching comment'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Comment not found or you do not have permission to edit it'
                });
            }

            const updateQuery = `
                UPDATE announcement_comments 
                SET comment_text = ?, updated_at = NOW()
                WHERE id = ? AND user_id = ?
            `;

            db.query(updateQuery, [comment_text, id, decoded.id], (updateErr, result) => {
                if (updateErr) {
                    console.error('Database error:', updateErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Error updating comment'
                    });
                }

                res.json({
                    success: true,
                    message: 'Comment updated successfully'
                });
            });
        });
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token'
        });
    }
});

// Delete a comment (user can delete their own comment)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please log in.'
        });
    }

    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if comment exists and belongs to the user
        const checkQuery = 'SELECT * FROM announcement_comments WHERE id = ? AND user_id = ?';
        db.query(checkQuery, [id, decoded.id], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching comment'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Comment not found or you do not have permission to delete it'
                });
            }

            const deleteQuery = 'DELETE FROM announcement_comments WHERE id = ? AND user_id = ?';
            db.query(deleteQuery, [id, decoded.id], (deleteErr, result) => {
                if (deleteErr) {
                    console.error('Database error:', deleteErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Error deleting comment'
                    });
                }

                res.json({
                    success: true,
                    message: 'Comment deleted successfully'
                });
            });
        });
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token'
        });
    }
});

// Get comment statistics for an announcement
router.get('/announcement/:announcementId/stats', (req, res) => {
    const { announcementId } = req.params;

    const query = `
        SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
        FROM announcement_comments 
        WHERE announcement_id = ?
    `;

    db.query(query, [announcementId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching comment statistics'
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    });
});

module.exports = router;
