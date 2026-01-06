const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, getCurrentUser } = require('../middleware/auth');

// Get likes count for an announcement
router.get('/announcement/:announcementId', (req, res) => {
    const { announcementId } = req.params;

    const query = 'SELECT COUNT(*) as count FROM announcement_likes WHERE announcement_id = ?';

    db.query(query, [announcementId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching likes count'
            });
        }

        res.json({
            success: true,
            count: results[0].count
        });
    });
});

// Check if user has liked an announcement (supports both authenticated and guest users)
router.get('/announcement/:announcementId/check', (req, res) => {
    const { announcementId } = req.params;
    const { userEmail } = req.query;
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // If token exists, check by user_id
    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const query = 'SELECT id FROM announcement_likes WHERE announcement_id = ? AND user_id = ?';
            db.query(query, [announcementId, decoded.id], (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error checking like status'
                    });
                }

                res.json({
                    success: true,
                    liked: results.length > 0
                });
            });
        } catch (error) {
            // Token invalid, fall back to email check
            if (userEmail) {
                const query = 'SELECT id FROM announcement_likes WHERE announcement_id = ? AND user_email = ?';
                db.query(query, [announcementId, userEmail], (err, results) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Error checking like status'
                        });
                    }

                    res.json({
                        success: true,
                        liked: results.length > 0
                    });
                });
            } else {
                res.json({
                    success: true,
                    liked: false
                });
            }
        }
    } else if (userEmail) {
        // Guest user - check by email
        const query = 'SELECT id FROM announcement_likes WHERE announcement_id = ? AND user_email = ?';
        db.query(query, [announcementId, userEmail], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error checking like status'
                });
            }

            res.json({
                success: true,
                liked: results.length > 0
            });
        });
    } else {
        res.json({
            success: true,
            liked: false
        });
    }
});

// Toggle like (like or unlike) - supports both authenticated and guest users
router.post('/toggle', (req, res) => {
    const { announcement_id, user_email, user_name } = req.body;
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!announcement_id) {
        return res.status(400).json({
            success: false,
            message: 'Announcement ID is required'
        });
    }

    // If token exists, use authenticated user
    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user details
            const getUserQuery = 'SELECT id, username, email, firstName, lastName FROM admin_users WHERE id = ?';
            db.query(getUserQuery, [decoded.id], (userErr, userResults) => {
                if (userErr || userResults.length === 0) {
                    console.error('Database error:', userErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Error fetching user details'
                    });
                }

                const user = userResults[0];
                const fullName = user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.username;

                // Check if like already exists
                const checkQuery = 'SELECT id FROM announcement_likes WHERE announcement_id = ? AND user_id = ?';

                db.query(checkQuery, [announcement_id, user.id], (err, results) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({
                            success: false,
                            message: 'Error checking like status'
                        });
                    }

                    if (results.length > 0) {
                        // Unlike - remove the like
                        const deleteQuery = 'DELETE FROM announcement_likes WHERE announcement_id = ? AND user_id = ?';

                        db.query(deleteQuery, [announcement_id, user.id], (deleteErr) => {
                            if (deleteErr) {
                                console.error('Database error:', deleteErr);
                                return res.status(500).json({
                                    success: false,
                                    message: 'Error removing like'
                                });
                            }

                            // Get updated count
                            const countQuery = 'SELECT COUNT(*) as count FROM announcement_likes WHERE announcement_id = ?';
                            db.query(countQuery, [announcement_id], (countErr, countResults) => {
                                if (countErr) {
                                    console.error('Database error:', countErr);
                                }

                                res.json({
                                    success: true,
                                    message: 'Like removed successfully',
                                    liked: false,
                                    count: countResults ? countResults[0].count : 0
                                });
                            });
                        });
                    } else {
                        // Like - add the like
                        const insertQuery = 'INSERT INTO announcement_likes (announcement_id, user_id, user_email, user_name) VALUES (?, ?, ?, ?)';

                        db.query(insertQuery, [announcement_id, user.id, user.email, fullName], (insertErr) => {
                            if (insertErr) {
                                console.error('Database error:', insertErr);
                                return res.status(500).json({
                                    success: false,
                                    message: 'Error adding like'
                                });
                            }

                            // Get updated count
                            const countQuery = 'SELECT COUNT(*) as count FROM announcement_likes WHERE announcement_id = ?';
                            db.query(countQuery, [announcement_id], (countErr, countResults) => {
                                if (countErr) {
                                    console.error('Database error:', countErr);
                                }

                                res.json({
                                    success: true,
                                    message: 'Like added successfully',
                                    liked: true,
                                    count: countResults ? countResults[0].count : 1
                                });
                            });
                        });
                    }
                });
            });
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token'
            });
        }
    } else {
        // Guest user - require email and name
        if (!user_email || !user_name) {
            return res.status(400).json({
                success: false,
                message: 'User email and name are required for guest users'
            });
        }

        // Check if like already exists
        const checkQuery = 'SELECT id FROM announcement_likes WHERE announcement_id = ? AND user_email = ?';

        db.query(checkQuery, [announcement_id, user_email], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error checking like status'
                });
            }

            if (results.length > 0) {
                // Unlike - remove the like
                const deleteQuery = 'DELETE FROM announcement_likes WHERE announcement_id = ? AND user_email = ?';

                db.query(deleteQuery, [announcement_id, user_email], (deleteErr) => {
                    if (deleteErr) {
                        console.error('Database error:', deleteErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Error removing like'
                        });
                    }

                    // Get updated count
                    const countQuery = 'SELECT COUNT(*) as count FROM announcement_likes WHERE announcement_id = ?';
                    db.query(countQuery, [announcement_id], (countErr, countResults) => {
                        if (countErr) {
                            console.error('Database error:', countErr);
                        }

                        res.json({
                            success: true,
                            message: 'Like removed successfully',
                            liked: false,
                            count: countResults ? countResults[0].count : 0
                        });
                    });
                });
            } else {
                // Like - add the like
                const insertQuery = 'INSERT INTO announcement_likes (announcement_id, user_email, user_name) VALUES (?, ?, ?)';

                db.query(insertQuery, [announcement_id, user_email, user_name], (insertErr) => {
                    if (insertErr) {
                        console.error('Database error:', insertErr);
                        return res.status(500).json({
                            success: false,
                            message: 'Error adding like'
                        });
                    }

                    // Get updated count
                    const countQuery = 'SELECT COUNT(*) as count FROM announcement_likes WHERE announcement_id = ?';
                    db.query(countQuery, [announcement_id], (countErr, countResults) => {
                        if (countErr) {
                            console.error('Database error:', countErr);
                        }

                        res.json({
                            success: true,
                            message: 'Like added successfully',
                            liked: true,
                            count: countResults ? countResults[0].count : 1
                        });
                    });
                });
            }
        });
    }
});

// Get all likes for an announcement (with user details)
router.get('/announcement/:announcementId/details', (req, res) => {
    const { announcementId } = req.params;

    const query = `
        SELECT user_name, user_email, created_at 
        FROM announcement_likes 
        WHERE announcement_id = ? 
        ORDER BY created_at DESC
    `;

    db.query(query, [announcementId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching likes'
            });
        }

        res.json({
            success: true,
            data: results,
            count: results.length
        });
    });
});

module.exports = router;
