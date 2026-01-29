const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');
const { verifyToken, requireRole, getCurrentUser } = require('../middleware/auth');

// ================== PUBLIC ROUTES ==================

// Get all active categories with resource count
router.get('/', async (req, res) => {
    try {
        const db = getDB();

        // Use aggregation to count resources per category
        const categories = await db.collection('resource_categories')
            .find({ status: 'active' })
            .sort({ display_order: 1, name: 1 })
            .toArray();

        // Get resource counts for all active resources
        const counts = await db.collection('resources').aggregate([
            { $match: { status: 'Active' } },
            { $group: { _id: '$category_id', count: { $sum: 1 } } }
        ]).toArray();

        // Create a map for easy lookup
        const countMap = {};
        counts.forEach(c => {
            if (c._id) countMap[c._id.toString()] = c.count;
        });

        const formattedCategories = categories.map(cat => ({
            ...cat,
            id: cat._id,
            resource_count: countMap[cat._id.toString()] || 0
        }));

        res.json({
            success: true,
            data: formattedCategories,
            count: formattedCategories.length
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching categories'
        });
    }
});

// Get category by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid category ID' });
        }

        const db = getDB();
        const category = await db.collection('resource_categories').findOne({ _id: new ObjectId(id) });

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.json({
            success: true,
            data: { ...category, id: category._id }
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching category'
        });
    }
});

// ================== ADMIN ROUTES ==================
router.use(verifyToken);
router.use(getCurrentUser);

// Get all categories for admin (including inactive)
router.get('/admin/all', requireRole(['super_admin', 'admin', 'editor']), async (req, res) => {
    try {
        const db = getDB();
        const categories = await db.collection('resource_categories')
            .find({})
            .sort({ display_order: 1, name: 1 })
            .toArray();

        res.json({
            success: true,
            data: categories.map(cat => ({ ...cat, id: cat._id })),
            count: categories.length
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching categories'
        });
    }
});

// Create new category
router.post('/', requireRole(['super_admin', 'admin']), async (req, res) => {
    try {
        const { name, description, icon, color, display_order, status } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        const db = getDB();
        const newCategory = {
            name,
            description: description || '',
            icon: icon || 'folder',
            color: color || '#0b4ea2',
            display_order: parseInt(display_order) || 0,
            status: status || 'active',
            created_at: new Date(),
            updated_at: new Date()
        };

        const result = await db.collection('resource_categories').insertOne(newCategory);

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: { ...newCategory, id: result.insertedId }
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error creating category'
        });
    }
});

// Update category
router.put('/:id', requireRole(['super_admin', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid category ID' });
        }

        const { name, description, icon, color, display_order, status } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        const db = getDB();
        const updateData = {
            name,
            description: description || '',
            icon: icon || 'folder',
            color: color || '#0b4ea2',
            display_order: parseInt(display_order) || 0,
            status: status || 'active',
            updated_at: new Date()
        };

        const result = await db.collection('resource_categories').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.json({
            success: true,
            message: 'Category updated successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error updating category'
        });
    }
});

// Delete category
router.delete('/:id', requireRole(['super_admin', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid category ID' });
        }

        const db = getDB();

        // Check if category has resources
        const resourceCount = await db.collection('resources').countDocuments({ category_id: id });
        if (resourceCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category that contains resources. Please reassign or delete the resources first.'
            });
        }

        const result = await db.collection('resource_categories').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error deleting category'
        });
    }
});

module.exports = router;