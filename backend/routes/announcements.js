const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');
const { verifyToken, requireRole, getCurrentUser } = require('../middleware/auth');

// Get all announcements (public endpoint)
router.get('/', async (req, res) => {
    try {
        const { visibility, status, limit } = req.query;
        const db = getDB();

        let query = {
            $and: [
                { $or: [{ expiryDate: null }, { expiryDate: { $gt: new Date() } }] }
            ]
        };

        // Filter by visibility
        if (visibility) {
            query.visibility = visibility;
        }

        // Filter by status (default to published for public)
        if (status) {
            query.status = status;
        } else {
            query.status = "published";
        }

        // Priority ordering logic
        const priorityOrder = { "urgent": 0, "high": 1, "normal": 2, "low": 3 };

        const results = await db.collection('announcements')
            .find(query)
            .sort({ publishDate: -1 }) // Primary sort by date, then we'll refine by priority in JS for simplicity or use aggregation
            .toArray();

        // Refined sorting by priority and date
        results.sort((a, b) => {
            const pA = priorityOrder[a.priority] !== undefined ? priorityOrder[a.priority] : 2;
            const pB = priorityOrder[b.priority] !== undefined ? priorityOrder[b.priority] : 2;
            if (pA !== pB) return pA - pB;
            return new Date(b.publishDate) - new Date(a.publishDate);
        });

        const finalResults = limit ? results.slice(0, parseInt(limit)) : results;

        // Fetch admin users to map names
        const adminUsers = await db.collection('admin_users').find({}).toArray();
        const userMap = {};
        adminUsers.forEach(u => userMap[u._id.toString()] = u.username);

        const data = finalResults.map(a => ({
            ...a,
            id: a._id,
            createdByName: userMap[a.created_by?.toString()] || 'Unknown'
        }));

        res.json({
            success: true,
            data: data,
            count: data.length
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching announcements'
        });
    }
});

// Get single announcement (public)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        const db = getDB();
        const item = await db.collection('announcements').findOne({
            _id: new ObjectId(id),
            status: "published",
            $or: [{ expiryDate: null }, { expiryDate: { $gt: new Date() } }]
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        const adminUser = await db.collection('admin_users').findOne({ _id: new ObjectId(item.created_by) });

        res.json({
            success: true,
            data: {
                ...item,
                id: item._id,
                createdByName: adminUser ? adminUser.username : 'Unknown'
            }
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching announcement'
        });
    }
});

// Get all announcements for admin (including drafts and archived)
router.get('/admin/all', verifyToken, getCurrentUser, requireRole(['super_admin', 'admin', 'editor']), async (req, res) => {
    try {
        const { status, visibility } = req.query;
        const db = getDB();

        let query = {};

        if (status) {
            query.status = status;
        }

        if (visibility) {
            query.visibility = visibility;
        }

        const results = await db.collection('announcements')
            .find(query)
            .sort({ created_at: -1 })
            .toArray();

        const adminUsers = await db.collection('admin_users').find({}).toArray();
        const userMap = {};
        adminUsers.forEach(u => userMap[u._id.toString()] = u.username);

        const data = results.map(a => ({
            ...a,
            id: a._id,
            createdByName: userMap[a.created_by?.toString()] || 'Unknown'
        }));

        res.json({
            success: true,
            data: data,
            count: data.length
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching announcements'
        });
    }
});

// Create new announcement
router.post('/', verifyToken, getCurrentUser, requireRole(['super_admin', 'admin', 'editor']), async (req, res) => {
    try {
        const { title, content, visibility, priority, status, publishDate, expiryDate } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        const db = getDB();
        const newItem = {
            title,
            content,
            visibility: visibility || 'public',
            priority: priority || 'normal',
            status: status || 'published',
            publishDate: publishDate ? new Date(publishDate) : new Date(),
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            created_by: req.user.id,
            created_at: new Date(),
            updated_at: new Date()
        };

        const result = await db.collection('announcements').insertOne(newItem);

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            id: result.insertedId
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error creating announcement'
        });
    }
});

// Update announcement
router.put('/:id', verifyToken, getCurrentUser, requireRole(['super_admin', 'admin', 'editor']), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, visibility, priority, status, publishDate, expiryDate } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        const db = getDB();
        const updateData = {
            title,
            content,
            visibility: visibility || 'public',
            priority: priority || 'normal',
            status: status || 'published',
            publishDate: publishDate ? new Date(publishDate) : undefined,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            updated_at: new Date()
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const result = await db.collection('announcements').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        res.json({
            success: true,
            message: 'Announcement updated successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error updating announcement'
        });
    }
});

// Delete announcement
router.delete('/:id', verifyToken, getCurrentUser, requireRole(['super_admin', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        const db = getDB();
        const result = await db.collection('announcements').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found'
            });
        }

        res.json({
            success: true,
            message: 'Announcement deleted successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error deleting announcement'
        });
    }
});

// Get announcement statistics
router.get('/admin/stats', verifyToken, getCurrentUser, requireRole(['super_admin', 'admin', 'editor']), async (req, res) => {
    try {
        const db = getDB();

        const [
            total,
            published,
            draft,
            archived,
            publicCount,
            members,
            byPriority,
            recent
        ] = await Promise.all([
            db.collection('announcements').countDocuments({}),
            db.collection('announcements').countDocuments({ status: "published" }),
            db.collection('announcements').countDocuments({ status: "draft" }),
            db.collection('announcements').countDocuments({ status: "archived" }),
            db.collection('announcements').countDocuments({ visibility: "public" }),
            db.collection('announcements').countDocuments({ visibility: "members" }),
            db.collection('announcements').aggregate([
                { $group: { _id: "$priority", count: { $sum: 1 } } }
            ]).toArray(),
            db.collection('announcements').countDocuments({
                created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            })
        ]);

        const stats = {
            total,
            published,
            draft,
            archived,
            public: publicCount,
            members,
            byPriority: byPriority.map(p => ({ priority: p._id, count: p.count })),
            recent
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching announcement statistics'
        });
    }
});

module.exports = router;
