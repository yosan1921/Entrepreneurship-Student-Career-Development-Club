const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');
const { verifyToken, requireRole, getCurrentUser } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create leadership images directory
const leadershipImagesDir = path.join(__dirname, '../uploads/leadership');
if (!fs.existsSync(leadershipImagesDir)) {
    fs.mkdirSync(leadershipImagesDir, { recursive: true });
}

// Configure multer for leadership image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, leadershipImagesDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `leader_${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// Get all leadership members (public)
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const leadershipCollection = db.collection('leadership');

        const leaders = await leadershipCollection
            .find({
                status: 'active',
                $or: [
                    { sector: 'Leadership Team' },
                    { sector: null }
                ]
            })
            .sort({ display_order: 1, _id: 1 })
            .toArray();

        const formattedLeaders = leaders.map(leader => ({
            ...leader,
            id: leader._id,
            _id: undefined
        }));

        res.json({
            success: true,
            leadership: formattedLeaders
        });
    } catch (error) {
        console.error('Error fetching leadership:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leadership: ' + error.message
        });
    }
});

// Admin routes - require authentication
router.use(verifyToken);
router.use(getCurrentUser);

// Get all leadership members for admin (including inactive)
router.get('/admin', requireRole(['super_admin', 'admin', 'editor']), async (req, res) => {
    try {
        const db = getDB();
        const leadershipCollection = db.collection('leadership');

        const leaders = await leadershipCollection
            .find({})
            .sort({ display_order: 1, _id: 1 })
            .toArray();

        const formattedLeaders = leaders.map(leader => ({
            ...leader,
            id: leader._id,
            _id: undefined
        }));

        res.json({
            success: true,
            leadership: formattedLeaders
        });
    } catch (error) {
        console.error('Error fetching leadership (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leadership: ' + error.message
        });
    }
});

// Create new leadership member
router.post('/', requireRole(['super_admin', 'admin']), upload.single('photo'), async (req, res) => {
    try {
        const db = getDB();
        const leadershipCollection = db.collection('leadership');

        const { name, position, email, phone, bio, displayOrder, status } = req.body;

        if (!name || !position) {
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Name and position are required'
            });
        }

        let photoPath = null;
        if (req.file) {
            photoPath = `/uploads/leadership/${req.file.filename}`;
        }

        const newLeader = {
            name,
            position,
            email: email || null,
            phone: phone || null,
            bio: bio || null,
            display_order: parseInt(displayOrder) || 0,
            status: status || 'active',
            photo: photoPath,
            sector: 'Leadership Team',
            created_at: new Date(),
            updated_at: new Date()
        };

        const result = await leadershipCollection.insertOne(newLeader);

        res.status(201).json({
            success: true,
            message: 'Leadership member created successfully',
            id: result.insertedId,
            data: {
                ...newLeader,
                id: result.insertedId,
                _id: undefined
            }
        });
    } catch (error) {
        console.error('Create leadership error:', error);
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Error creating leadership member: ' + error.message
        });
    }
});

// Update leadership member
router.put('/:id', requireRole(['super_admin', 'admin']), upload.single('photo'), async (req, res) => {
    try {
        const db = getDB();
        const leadershipCollection = db.collection('leadership');
        const { id } = req.params;
        const { name, position, email, phone, bio, displayOrder, status } = req.body;

        if (!ObjectId.isValid(id)) {
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Invalid leadership ID'
            });
        }

        if (!name || !position) {
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Name and position are required'
            });
        }

        // Get current data
        const currentLeader = await leadershipCollection.findOne({ _id: new ObjectId(id) });

        if (!currentLeader) {
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                message: 'Leadership member not found'
            });
        }

        let photoPath = currentLeader.photo;
        if (req.file) {
            photoPath = `/uploads/leadership/${req.file.filename}`;
        }

        const updateData = {
            name,
            position,
            email: email || null,
            phone: phone || null,
            bio: bio || null,
            display_order: parseInt(displayOrder) || 0,
            status: status || 'active',
            updated_at: new Date()
        };

        if (req.file) {
            updateData.photo = photoPath;
        }

        const result = await leadershipCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        // Delete old photo if new one was uploaded
        if (req.file && currentLeader.photo && currentLeader.photo !== photoPath) {
            const oldImagePath = path.join(__dirname, '..', currentLeader.photo);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
                console.log(`🗑️ Deleted old image: ${oldImagePath}`);
            }
        }

        res.json({
            success: true,
            message: 'Leadership member updated successfully',
            data: {
                id: new ObjectId(id),
                ...updateData,
                photo: photoPath
            }
        });
    } catch (error) {
        console.error('Update leadership error:', error);
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Error updating leadership member: ' + error.message
        });
    }
});

// Upload leadership member image
router.post('/:id/upload-image', requireRole(['super_admin', 'admin']), upload.single('image'), async (req, res) => {
    try {
        const db = getDB();
        const leadershipCollection = db.collection('leadership');
        const { id } = req.params;

        console.log(`🖼️ Attempting to upload image for leadership member ID: ${id}`);

        if (!ObjectId.isValid(id)) {
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                success: false,
                message: 'Invalid leadership ID'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file uploaded'
            });
        }

        const imagePath = `/uploads/leadership/${req.file.filename}`;

        // Get current image
        const currentLeader = await leadershipCollection.findOne({ _id: new ObjectId(id) });

        if (!currentLeader) {
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: `Leadership member with ID ${id} not found`
            });
        }

        // Update with new image
        await leadershipCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { photo: imagePath, updated_at: new Date() } }
        );

        // Delete old image
        if (currentLeader.photo && currentLeader.photo !== imagePath) {
            const oldImagePath = path.join(__dirname, '..', currentLeader.photo);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
                console.log(`🗑️ Deleted old image: ${oldImagePath}`);
            }
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                imagePath: imagePath,
                imageUrl: `${baseUrl}${imagePath}`
            }
        });
    } catch (error) {
        console.error('Upload image error:', error);
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Error uploading image: ' + error.message
        });
    }
});

// Delete leadership member image
router.delete('/:id/image', requireRole(['super_admin', 'admin']), async (req, res) => {
    try {
        const db = getDB();
        const leadershipCollection = db.collection('leadership');
        const { id } = req.params;

        console.log(`🗑️ Attempting to delete image for leadership member ID: ${id}`);

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid leadership ID'
            });
        }

        const currentLeader = await leadershipCollection.findOne({ _id: new ObjectId(id) });

        if (!currentLeader) {
            return res.status(404).json({
                success: false,
                message: `Leadership member with ID ${id} not found`
            });
        }

        // Update database
        await leadershipCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { photo: null, updated_at: new Date() } }
        );

        // Delete image file
        if (currentLeader.photo) {
            const imagePath = path.join(__dirname, '..', currentLeader.photo);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log(`🗑️ Deleted image file: ${imagePath}`);
            }
        }

        res.json({
            success: true,
            message: 'Image removed successfully'
        });
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing image: ' + error.message
        });
    }
});

// Delete leadership member
router.delete('/:id', requireRole(['super_admin', 'admin']), async (req, res) => {
    try {
        const db = getDB();
        const leadershipCollection = db.collection('leadership');
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid leadership ID'
            });
        }

        const result = await leadershipCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Leadership member not found'
            });
        }

        res.json({
            success: true,
            message: 'Leadership member deleted successfully'
        });
    } catch (error) {
        console.error('Delete leadership error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting leadership member: ' + error.message
        });
    }
});

module.exports = router;
