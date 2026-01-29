const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

// Get all comments for an announcement (public)
router.get('/announcement/:announcementId', async (req, res) => {
    try {
        const { announcementId } = req.params;
        if (!ObjectId.isValid(announcementId)) {
            return res.status(400).json({ success: false, message: 'Invalid announcement ID' });
        }

        const db = getDB();
        const results = await db.collection('announcement_comments')
            .find({ announcement_id: announcementId, status: 'approved' })
            .sort({ created_at: -1 })
            .toArray();

        res.json({
            success: true,
            data: results.map(r => ({ ...r, id: r._id })),
            count: results.length
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching comments'
        });
    }
});

// Add a new comment (supports authenticated users)
router.post('/', async (req, res) => {
    try {
        const { announcement_id, comment_text } = req.body;
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!announcement_id || !comment_text) {
            return res.status(400).json({
                success: false,
                message: 'Announcement ID and comment text are required'
            });
        }

        const db = getDB();

        // Check if announcement exists
        const announcement = await db.collection('announcements').findOne({
            _id: new ObjectId(announcement_id),
            status: "published"
        });

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Announcement not found or not published'
            });
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please log in to comment.'
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token. Please log in.'
            });
        }

        // Get user details
        const user = await db.collection('admin_users').findOne({ _id: new ObjectId(decoded.id) });
        if (!user) {
            return res.status(500).json({
                success: false,
                message: 'Error fetching user details'
            });
        }

        const fullName = user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : user.username;

        const newComment = {
            announcement_id: announcement_id,
            user_id: user._id.toString(),
            user_name: fullName,
            user_email: user.email,
            comment_text,
            status: 'approved',
            created_at: new Date(),
            updated_at: new Date()
        };

        const result = await db.collection('announcement_comments').insertOne(newComment);

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: {
                id: result.insertedId,
                ...newComment
            }
        });
    } catch (err) {
        console.error('Error adding comment:', err);
        res.status(500).json({
            success: false,
            message: 'Error adding comment: ' + err.message
        });
    }
});

// Update a comment (user can edit their own comment)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { comment_text } = req.body;
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

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

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token'
            });
        }

        const db = getDB();
        const result = await db.collection('announcement_comments').updateOne(
            { _id: new ObjectId(id), user_id: decoded.id },
            { $set: { comment_text, updated_at: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found or you do not have permission to edit it'
            });
        }

        res.json({
            success: true,
            message: 'Comment updated successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error updating comment'
        });
    }
});

// Delete a comment (user can delete their own comment)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please log in.'
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token'
            });
        }

        const db = getDB();
        const result = await db.collection('announcement_comments').deleteOne({
            _id: new ObjectId(id),
            user_id: decoded.id
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found or you do not have permission to delete it'
            });
        }

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error deleting comment'
        });
    }
});

// Get comment statistics for an announcement
router.get('/announcement/:announcementId/stats', async (req, res) => {
    try {
        const { announcementId } = req.params;
        const db = getDB();

        const [total, approved, pending] = await Promise.all([
            db.collection('announcement_comments').countDocuments({ announcement_id: announcementId }),
            db.collection('announcement_comments').countDocuments({ announcement_id: announcementId, status: 'approved' }),
            db.collection('announcement_comments').countDocuments({ announcement_id: announcementId, status: 'pending' })
        ]);

        res.json({
            success: true,
            data: { total, approved, pending }
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching comment statistics'
        });
    }
});

module.exports = router;
