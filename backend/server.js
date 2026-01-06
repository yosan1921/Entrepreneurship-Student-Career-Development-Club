const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Test database connection
function testConnection() {
    // Connection test is handled in db.js
    console.log('Database connection initialized');
}

testConnection();

// Routes - Fixed to avoid conflicts
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/members', require('./routes/members'));
app.use('/api/events', require('./routes/events'));
app.use('/api/news', require('./routes/news'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/leadership', require('./routes/leadership'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/gallery-test', require('./routes/gallery-test')); // Test upload without auth
app.use('/api/resources', require('./routes/resources'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/announcement-comments', require('./routes/announcement-comments'));
app.use('/api/announcement-likes', require('./routes/announcement-likes'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/system-settings', require('./routes/system-settings'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        message: 'ESCDC Backend API is running!',
        database: 'MySQL (XAMPP)',
        timestamp: new Date().toISOString()
    });
});

// API Documentation
app.get('/api/docs', (req, res) => {
    res.json({
        message: 'ESCDC API Documentation',
        version: '1.0.0',
        endpoints: {
            auth: {
                'POST /api/login': 'User login',
                'POST /api/logout': 'User logout (requires auth)',
                'POST /api/reset-password': 'Reset password with token'
            },
            members: {
                'POST /api/members': 'Create new member',
                'GET /api/members': 'Get all members',
                'DELETE /api/members/:id': 'Delete member (requires auth)'
            },
            events: {
                'POST /api/events': 'Create new event (requires auth)',
                'GET /api/events': 'Get all events',
                'PUT /api/events/:id': 'Update event (requires auth)',
                'DELETE /api/events/:id': 'Delete event (requires auth)'
            },
            leadership: {
                'POST /api/leaders': 'Create new leader (requires auth)',
                'GET /api/leaders': 'Get all leaders',
                'PUT /api/leaders/:id': 'Update leader (requires auth)'
            },
            gallery: {
                'POST /api/gallery': 'Create gallery item (requires auth)',
                'GET /api/gallery': 'Get all gallery items',
                'DELETE /api/gallery/:id': 'Delete gallery item (requires auth)'
            },
            resources: {
                'POST /api/resources': 'Create new resource (requires auth)',
                'GET /api/resources': 'Get all resources',
                'DELETE /api/resources/:id': 'Delete resource (requires auth)'
            }
        }
    });
});

// Test database tables
app.get('/api/test-db', (req, res) => {
    const query = 'SHOW TABLES';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Database error',
                error: err.message
            });
        }

        res.json({
            success: true,
            message: 'Database connection working',
            tables: results
        });
    });
});

// Test members table structure
app.get('/api/test-members-table', (req, res) => {
    const query = 'DESCRIBE members';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error checking members table',
                error: err.message
            });
        }

        res.json({
            success: true,
            message: 'Members table structure',
            structure: results
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Make sure XAMPP MySQL is running`);
});