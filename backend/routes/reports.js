const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');
const { verifyToken, requireRole, getCurrentUser } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, '../uploads/reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, reportsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${baseName}_${uniqueSuffix}${ext}`);
    }
});

// File filter for documents
const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /application\/(pdf|msword|vnd\.|text\/)/;

    if (mimetype.test(file.mimetype) && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only documents (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT) are allowed!'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: fileFilter
});

// Get all reports (public endpoint with visibility control)
router.get('/', async (req, res) => {
    try {
        const { type, academicYear, period, visibility } = req.query;
        const db = getDB();

        let query = { status: "published" };

        if (type) query.type = type;
        if (academicYear) query.academicYear = academicYear;
        if (period) query.period = period;

        if (visibility) {
            query.visibility = visibility;
        } else {
            query.visibility = { $in: ["public", "members"] };
        }

        const reports = await db.collection('reports')
            .find(query)
            .sort({ created_at: -1 })
            .toArray();

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const data = reports.map(report => ({
            ...report,
            id: report._id,
            downloadUrl: `${baseUrl}/api/reports/download/${report._id}`
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
            message: 'Error fetching reports'
        });
    }
});

// Download report file
router.get('/download/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        const db = getDB();
        const report = await db.collection('reports').findOne({
            _id: new ObjectId(id),
            status: "published"
        });

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        if (!report.file_path || !fs.existsSync(report.file_path)) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }

        // Increment download count
        await db.collection('reports').updateOne(
            { _id: new ObjectId(id) },
            { $inc: { downloadCount: 1 } }
        );

        res.setHeader('Content-Disposition', `attachment; filename="${report.file_name}"`);
        res.setHeader('Content-Type', report.fileType || 'application/octet-stream');
        res.sendFile(path.resolve(report.file_path));
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching report'
        });
    }
});

// Admin routes
router.use(verifyToken);
router.use(getCurrentUser);

// Get all reports for admin
router.get('/admin/all', requireRole(['super_admin', 'admin', 'editor']), async (req, res) => {
    try {
        const { type, status, visibility, academicYear } = req.query;
        const db = getDB();

        let query = {};
        if (type) query.type = type;
        if (status) query.status = status;
        if (visibility) query.visibility = visibility;
        if (academicYear) query.academicYear = academicYear;

        const reports = await db.collection('reports')
            .find(query)
            .sort({ created_at: -1 })
            .toArray();

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const data = reports.map(report => ({
            ...report,
            id: report._id,
            downloadUrl: `${baseUrl}/api/reports/download/${report._id}`
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
            message: 'Error fetching reports'
        });
    }
});

// Upload new report
router.post('/upload', upload.single('report'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const { title, description, type, period, academicYear, status, visibility } = req.body;

        if (!title || !type) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ success: false, message: 'Title and type are required' });
        }

        const db = getDB();
        const newReport = {
            type,
            title,
            file_path: req.file.path,
            file_name: req.file.filename,
            uploaded_by: req.user?.id || null,
            created_at: new Date(),
            description: description || '',
            period: period || '',
            academicYear: academicYear || new Date().getFullYear().toString(),
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            status: status || 'published',
            visibility: visibility || 'admin_only',
            downloadCount: 0,
            updatedAt: new Date()
        };

        const result = await db.collection('reports').insertOne(newReport);
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        res.status(201).json({
            success: true,
            message: 'Report uploaded successfully',
            data: {
                id: result.insertedId,
                title: title,
                file_name: req.file.filename,
                fileSize: req.file.size,
                downloadUrl: `${baseUrl}/api/reports/download/${result.insertedId}`
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({
            success: false,
            message: 'Error uploading file: ' + error.message
        });
    }
});

// Update report metadata
router.put('/:id', requireRole(['super_admin', 'admin', 'editor']), async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        const { title, description, type, period, academicYear, status, visibility } = req.body;

        if (!title || !type) {
            return res.status(400).json({ success: false, message: 'Title and type are required' });
        }

        const db = getDB();
        const updateData = {
            title,
            description: description || '',
            type,
            period: period || '',
            academicYear: academicYear || new Date().getFullYear().toString(),
            status: status || 'published',
            visibility: visibility || 'admin_only',
            updatedAt: new Date()
        };

        const result = await db.collection('reports').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        res.json({
            success: true,
            message: 'Report updated successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error updating report'
        });
    }
});

// Delete report
router.delete('/:id', requireRole(['super_admin', 'admin']), async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID' });
        }

        const db = getDB();
        const report = await db.collection('reports').findOne({ _id: new ObjectId(id) });

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        await db.collection('reports').deleteOne({ _id: new ObjectId(id) });

        if (report.file_path && fs.existsSync(report.file_path)) {
            try {
                fs.unlinkSync(report.file_path);
            } catch (fileErr) {
                console.error('Error deleting file:', fileErr);
            }
        }

        res.json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error deleting report'
        });
    }
});

// Get report statistics
router.get('/admin/stats', requireRole(['super_admin', 'admin', 'editor']), async (req, res) => {
    try {
        const db = getDB();
        const collection = db.collection('reports');

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            total,
            published,
            draft,
            byType,
            byYear,
            totalDownloadsArr,
            totalSizeArr,
            recent
        ] = await Promise.all([
            collection.countDocuments({}),
            collection.countDocuments({ status: 'published' }),
            collection.countDocuments({ status: 'draft' }),
            collection.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]).toArray(),
            collection.aggregate([{ $group: { _id: '$academicYear', count: { $sum: 1 } } }, { $sort: { _id: -1 } }]).toArray(),
            collection.aggregate([{ $group: { _id: null, total: { $sum: '$downloadCount' } } }]).toArray(),
            collection.aggregate([{ $group: { _id: null, totalSize: { $sum: '$fileSize' } } }]).toArray(),
            collection.countDocuments({ created_at: { $gte: thirtyDaysAgo } })
        ]);

        const stats = {
            total,
            published,
            draft,
            byType: byType.map(b => ({ type: b._id, count: b.count })),
            byYear: byYear.map(b => ({ academicYear: b._id, count: b.count })),
            totalDownloads: totalDownloadsArr[0]?.total || 0,
            totalSize: totalSizeArr[0]?.totalSize || 0,
            recent
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ success: false, message: 'Error fetching report statistics' });
    }
});

module.exports = router;
