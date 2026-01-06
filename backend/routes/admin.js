const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole, getCurrentUser } = require('../middleware/auth');

// Apply authentication to all admin routes
router.use(verifyToken);
router.use(getCurrentUser);

// Get all admin users (Super Admin only)
router.get('/users', requireRole(['super_admin']), (req, res) => {
    const query = 'SELECT id, username, email, firstName, lastName, role, status, lastLogin, createdAt FROM admin_users ORDER BY createdAt DESC';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching admin users'
            });
        }

        res.json({
            success: true,
            users: results
        });
    });
});

// Create new admin user (Super Admin only)
router.post('/users', requireRole(['super_admin']), async (req, res) => {
    const { username, email, password, firstName, lastName, role } = req.body;

    if (!username || !email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    if (!['super_admin', 'admin', 'editor'].includes(role)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid role'
        });
    }

    try {
        // Check if username or email already exists
        const checkQuery = 'SELECT * FROM admin_users WHERE username = ? OR email = ?';

        db.query(checkQuery, [username, email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Username or email already exists'
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user
            const insertQuery = 'INSERT INTO admin_users (username, email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?, ?)';

            db.query(insertQuery, [username, email, hashedPassword, firstName, lastName, role], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error creating user'
                    });
                }

                res.status(201).json({
                    success: true,
                    message: 'Admin user created successfully',
                    user: {
                        id: result.insertId,
                        username,
                        email,
                        firstName,
                        lastName,
                        role
                    }
                });
            });
        });

    } catch (error) {
        console.error('Error creating admin user:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user'
        });
    }
});

// Update admin user (Super Admin only)
router.put('/users/:id', requireRole(['super_admin']), (req, res) => {
    const { id } = req.params;
    const { username, email, firstName, lastName, role, status } = req.body;

    if (!username || !email || !firstName || !lastName || !role || !status) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    if (!['super_admin', 'admin', 'editor'].includes(role)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid role'
        });
    }

    if (!['active', 'inactive', 'suspended'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status'
        });
    }

    // Prevent super admin from changing their own role/status
    if (parseInt(id) === req.user.id && (role !== 'super_admin' || status !== 'active')) {
        return res.status(400).json({
            success: false,
            message: 'Cannot change your own role or deactivate your account'
        });
    }

    const updateQuery = 'UPDATE admin_users SET username = ?, email = ?, firstName = ?, lastName = ?, role = ?, status = ? WHERE id = ?';

    db.query(updateQuery, [username, email, firstName, lastName, role, status, id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error updating user'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully'
        });
    });
});

// Delete admin user (Super Admin only)
router.delete('/users/:id', requireRole(['super_admin']), (req, res) => {
    const { id } = req.params;

    // Prevent super admin from deleting themselves
    if (parseInt(id) === req.user.id) {
        return res.status(400).json({
            success: false,
            message: 'Cannot delete your own account'
        });
    }

    const deleteQuery = 'DELETE FROM admin_users WHERE id = ?';

    db.query(deleteQuery, [id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error deleting user'
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    });
});

// Get dashboard statistics (Admin and above)
router.get('/dashboard', requireRole(['super_admin', 'admin', 'editor']), (req, res) => {
    const queries = {
        totalMembers: 'SELECT COUNT(*) as count FROM members WHERE status = "active"',
        newMembers: 'SELECT COUNT(*) as count FROM members WHERE status = "active" AND registeredAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
        totalEvents: 'SELECT COUNT(*) as count FROM events',
        upcomingEvents: 'SELECT COUNT(*) as count FROM events WHERE status = "upcoming" AND date >= NOW()',
        completedEvents: 'SELECT COUNT(*) as count FROM events WHERE status = "completed"',
        newContacts: 'SELECT COUNT(*) as count FROM contacts WHERE status = "new"',
        totalContacts: 'SELECT COUNT(*) as count FROM contacts',
        totalLeadership: 'SELECT COUNT(*) as count FROM leadership WHERE status = "active"',
        totalGallery: 'SELECT COUNT(*) as count FROM gallery WHERE status = "active"',
        totalResources: 'SELECT COUNT(*) as count FROM resources WHERE status = "active"',
        resourceDownloads: 'SELECT SUM(downloadCount) as count FROM resources WHERE status = "active"'
    };

    const results = {};
    let completed = 0;
    const total = Object.keys(queries).length;

    Object.entries(queries).forEach(([key, query]) => {
        db.query(query, (err, result) => {
            if (err) {
                console.error(`Error in ${key} query:`, err);
                results[key] = 0;
            } else {
                results[key] = result[0].count || 0;
            }

            completed++;
            if (completed === total) {
                // Get recent activities
                const recentActivitiesQuery = `
                    (SELECT 'member' as type, fullName as title, registeredAt as date FROM members ORDER BY registeredAt DESC LIMIT 3)
                    UNION ALL
                    (SELECT 'contact' as type, CONCAT(name, ' - ', subject) as title, submittedAt as date FROM contacts ORDER BY submittedAt DESC LIMIT 3)
                    UNION ALL
                    (SELECT 'event' as type, title, createdAt as date FROM events ORDER BY createdAt DESC LIMIT 3)
                    ORDER BY date DESC LIMIT 10
                `;

                db.query(recentActivitiesQuery, (err, activities) => {
                    if (err) {
                        console.error('Error fetching recent activities:', err);
                        activities = [];
                    }

                    res.json({
                        success: true,
                        stats: results,
                        recentActivities: activities
                    });
                });
            }
        });
    });
});

module.exports = router;