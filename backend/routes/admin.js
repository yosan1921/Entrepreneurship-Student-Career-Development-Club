const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');
const { verifyToken, requireRole, getCurrentUser } = require('../middleware/auth');

// Apply authentication to all admin routes
router.use(verifyToken);
router.use(getCurrentUser);

// Get all admin users (Super Admin only)
router.get('/users', requireRole(['super_admin']), async (req, res) => {
    try {
        const db = getDB();
        const users = await db.collection('admin_users')
            .find({}, { projection: { password: 0, resetToken: 0, resetTokenExpiry: 0 } })
            .sort({ createdAt: -1 })
            .toArray();

        // Convert _id to id for compatibility
        const formattedUsers = users.map(user => ({
            ...user,
            id: user._id
        }));

        res.json({
            success: true,
            users: formattedUsers
        });
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin users'
        });
    }
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
        const db = getDB();
        const usersCollection = db.collection('admin_users');

        // Check if username or email already exists
        const existingUser = await usersCollection.findOne({
            $or: [{ username: username }, { email: email }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await usersCollection.insertOne({
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role,
            status: 'active',
            createdAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Admin user created successfully',
            user: {
                id: result.insertedId,
                username,
                email,
                firstName,
                lastName,
                role
            }
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
router.put('/users/:id', requireRole(['super_admin']), async (req, res) => {
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
    if (id === req.user.id && (role !== 'super_admin' || status !== 'active')) {
        return res.status(400).json({
            success: false,
            message: 'Cannot change your own role or deactivate your account'
        });
    }

    try {
        const db = getDB();
        const result = await db.collection('admin_users').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    username,
                    email,
                    firstName,
                    lastName,
                    role,
                    status,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user'
        });
    }
});

// Delete admin user (Super Admin only)
router.delete('/users/:id', requireRole(['super_admin']), async (req, res) => {
    const { id } = req.params;

    // Prevent super admin from deleting themselves
    if (id === req.user.id) {
        return res.status(400).json({
            success: false,
            message: 'Cannot delete your own account'
        });
    }

    try {
        const db = getDB();
        const result = await db.collection('admin_users').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
});

// Get dashboard statistics (Admin and above)
router.get('/dashboard', requireRole(['super_admin', 'admin', 'editor']), async (req, res) => {
    try {
        const db = getDB();

        // Get counts from collections
        const [
            totalMembers,
            newMembers,
            totalEvents,
            upcomingEvents,
            completedEvents,
            newContacts,
            totalContacts,
            totalLeadership,
            totalGallery,
            totalResources,
            resourceDownloads
        ] = await Promise.all([
            db.collection('members').countDocuments({ status: "active" }),
            db.collection('members').countDocuments({
                status: "active",
                registeredAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }),
            db.collection('events').countDocuments({}),
            db.collection('events').countDocuments({ status: "upcoming", date: { $gte: new Date() } }),
            db.collection('events').countDocuments({ status: "completed" }),
            db.collection('contacts').countDocuments({ status: "new" }),
            db.collection('contacts').countDocuments({}),
            db.collection('leadership').countDocuments({ status: "active" }),
            db.collection('gallery').countDocuments({ status: "active" }),
            db.collection('resources').countDocuments({ status: "active" }),
            db.collection('resources').aggregate([
                { $match: { status: "active" } },
                { $group: { _id: null, total: { $sum: "$downloadCount" } } }
            ]).toArray()
        ]);

        const stats = {
            totalMembers,
            newMembers,
            totalEvents,
            upcomingEvents,
            completedEvents,
            newContacts,
            totalContacts,
            totalLeadership,
            totalGallery,
            totalResources,
            resourceDownloads: resourceDownloads[0]?.total || 0
        };

        // Get recent activities
        // Note: MongoDB doesn't have UNION ALL like SQL, so we'll fetch separately and merge
        const [recentMembers, recentContacts, recentEvents] = await Promise.all([
            db.collection('members').find({}).sort({ registeredAt: -1 }).limit(3).toArray(),
            db.collection('contacts').find({}).sort({ submittedAt: -1 }).limit(3).toArray(),
            db.collection('events').find({}).sort({ createdAt: -1 }).limit(3).toArray()
        ]);

        const activities = [
            ...recentMembers.map(m => ({ type: 'member', title: m.fullName, date: m.registeredAt })),
            ...recentContacts.map(c => ({ type: 'contact', title: `${c.name} - ${c.subject}`, date: c.submittedAt })),
            ...recentEvents.map(e => ({ type: 'event', title: e.title, date: e.createdAt }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        res.json({
            success: true,
            stats,
            recentActivities: activities
        });

    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data'
        });
    }
});

module.exports = router;