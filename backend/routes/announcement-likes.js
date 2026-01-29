const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

// Get likes count for an announcement
router.get('/announcement/:announcementId', async (req, res) => {
    try {
        const { announcementId } = req.params;
        const db = getDB();
        const count = await db.collection('announcement_likes').countDocuments({ announcement_id: announcementId });

        res.json({
            success: true,
            count: count
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching likes count'
        });
    }
});

// Check if user has liked an announcement (supports both authenticated and guest users)
router.get('/announcement/:announcementId/check', async (req, res) => {
    try {
        const { announcementId } = req.params;
        const { userEmail } = req.query;
        const token = req.header('Authorization')?.replace('Bearer ', '');
        const db = getDB();

        let liked = false;

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const result = await db.collection('announcement_likes').findOne({
                    announcement_id: announcementId,
                    user_id: decoded.id
                });
                liked = !!result;
            } catch (error) {
                // Token invalid, fall back to email check
                if (userEmail) {
                    const result = await db.collection('announcement_likes').findOne({
                        announcement_id: announcementId,
                        user_email: userEmail
                    });
                    liked = !!result;
                }
            }
        } else if (userEmail) {
            const result = await db.collection('announcement_likes').findOne({
                announcement_id: announcementId,
                user_email: userEmail
            });
            liked = !!result;
        }

        res.json({
            success: true,
            liked: liked
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error checking like status'
        });
    }
});

// Toggle like (like or unlike) - supports both authenticated and guest users
router.post('/toggle', async (req, res) => {
    try {
        const { announcement_id, user_email, user_name } = req.body;
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!announcement_id) {
            return res.status(400).json({
                success: false,
                message: 'Announcement ID is required'
            });
        }

        const db = getDB();
        let userLikeQuery = { announcement_id };

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await db.collection('admin_users').findOne({ _id: new ObjectId(decoded.id) });

                if (!user) {
                    return res.status(500).json({ success: false, message: 'Error fetching user details' });
                }

                userLikeQuery.user_id = user._id.toString();

                const existingLike = await db.collection('announcement_likes').findOne(userLikeQuery);

                if (existingLike) {
                    await db.collection('announcement_likes').deleteOne(userLikeQuery);
                    const count = await db.collection('announcement_likes').countDocuments({ announcement_id });
                    return res.json({ success: true, message: 'Like removed successfully', liked: false, count });
                } else {
                    const fullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username;
                    await db.collection('announcement_likes').insertOne({
                        announcement_id,
                        user_id: user._id.toString(),
                        user_email: user.email,
                        user_name: fullName,
                        created_at: new Date()
                    });
                    const count = await db.collection('announcement_likes').countDocuments({ announcement_id });
                    return res.json({ success: true, message: 'Like added successfully', liked: true, count });
                }
            } catch (error) {
                console.error('Token error:', error);
                return res.status(401).json({ success: false, message: 'Invalid authentication token' });
            }
        } else {
            if (!user_email || !user_name) {
                return res.status(400).json({ success: false, message: 'User email and name are required for guest users' });
            }

            userLikeQuery.user_email = user_email;
            const existingLike = await db.collection('announcement_likes').findOne(userLikeQuery);

            if (existingLike) {
                await db.collection('announcement_likes').deleteOne(userLikeQuery);
                const count = await db.collection('announcement_likes').countDocuments({ announcement_id });
                return res.json({ success: true, message: 'Like removed successfully', liked: false, count });
            } else {
                await db.collection('announcement_likes').insertOne({
                    announcement_id,
                    user_email,
                    user_name,
                    created_at: new Date()
                });
                const count = await db.collection('announcement_likes').countDocuments({ announcement_id });
                return res.json({ success: true, message: 'Like added successfully', liked: true, count });
            }
        }
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error toggling like'
        });
    }
});

// Get all likes for an announcement (with user details)
router.get('/announcement/:announcementId/details', async (req, res) => {
    try {
        const { announcementId } = req.params;
        const db = getDB();
        const results = await db.collection('announcement_likes')
            .find({ announcement_id: announcementId })
            .sort({ created_at: -1 })
            .toArray();

        res.json({
            success: true,
            data: results,
            count: results.length
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching likes'
        });
    }
});

module.exports = router;
