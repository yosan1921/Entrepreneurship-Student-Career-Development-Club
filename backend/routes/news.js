const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

// Get all news (public)
router.get('/', async (req, res) => {
    console.log('📰 GET /api/news called');

    try {
        const db = getDB();
        const { category, status = 'published', limit = 50, offset = 0 } = req.query;

        const query = { status };

        if (category) {
            query.category = category;
        }

        const newsCollection = db.collection('news');
        const results = await newsCollection
            .find(query)
            .sort({ publishDate: -1, createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .toArray();

        console.log(`✅ News found: ${results.length}`);

        res.json({
            success: true,
            count: results.length,
            news: results.map(n => ({ ...n, id: n._id }))
        });
    } catch (error) {
        console.error('News fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching news: ' + error.message
        });
    }
});

// Get all news for admin (including drafts)
router.get('/admin', async (req, res) => {
    console.log('📰 GET /api/news/admin called');

    try {
        const db = getDB();
        const { category, status, limit = 50, offset = 0 } = req.query;

        let query = {};

        if (category) {
            query.category = category;
        }

        if (status) {
            query.status = status;
        }

        const newsCollection = db.collection('news');
        const results = await newsCollection
            .find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .toArray();

        console.log(`✅ Admin news found: ${results.length}`);

        res.json({
            success: true,
            count: results.length,
            news: results.map(n => ({ ...n, id: n._id }))
        });
    } catch (error) {
        console.error('Admin news fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching news: ' + error.message
        });
    }
});

// Get single news item
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid news ID' });
        }

        const db = getDB();
        const news = await db.collection('news').findOne({ _id: new ObjectId(id) });

        if (!news) {
            return res.status(404).json({ success: false, message: 'News not found' });
        }

        res.json({
            success: true,
            news: { ...news, id: news._id }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create news
router.post('/', async (req, res) => {
    console.log('📰 POST /api/news called');

    try {
        const { title, content, category, status, publishDate } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        const db = getDB();
        const newNews = {
            title,
            content,
            category: category || 'General',
            status: status || 'published',
            publishDate: publishDate || new Date().toISOString().split('T')[0],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('news').insertOne(newNews);
        console.log('✅ News created with ID:', result.insertedId);

        res.status(201).json({
            success: true,
            message: 'News created successfully',
            id: result.insertedId
        });
    } catch (error) {
        console.error('Create news error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating news: ' + error.message
        });
    }
});

// Update news
router.put('/:id', async (req, res) => {
    console.log('📰 PUT /api/news/:id called');

    try {
        const { id } = req.params;
        const { title, content, category, status, publishDate } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid news ID'
            });
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
            category,
            status,
            publishDate,
            updatedAt: new Date()
        };

        const result = await db.collection('news').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        console.log('✅ News updated');

        res.json({
            success: true,
            message: 'News updated successfully'
        });
    } catch (error) {
        console.error('Update news error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating news: ' + error.message
        });
    }
});

// Delete news
router.delete('/:id', async (req, res) => {
    console.log('📰 DELETE /api/news/:id called');

    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid news ID'
            });
        }

        const db = getDB();
        const result = await db.collection('news').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        console.log('✅ News deleted');

        res.json({
            success: true,
            message: 'News deleted successfully'
        });
    } catch (error) {
        console.error('Delete news error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting news: ' + error.message
        });
    }
});

module.exports = router;

module.exports = router;