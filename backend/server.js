const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectDB } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'https://entrepreneurship-student-career-development.vercel.app', // Update this with your actual Vercel URL
    /\.vercel\.app$/ // This allows all Vercel preview deployments
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(ao => {
            if (ao instanceof RegExp) return ao.test(origin);
            return ao === origin;
        })) {
            return callback(null, true);
        }
        return callback(null, true); // Fallback to true during setup, or refine for security
    },
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Initialize database connection
async function initializeDatabase() {
    try {
        await connectDB();
        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        process.exit(1);
    }
}

initializeDatabase();

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

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to ESCDC Backend API',
        status: 'Online',
        endpoints: '/api/docs'
    });
});

// API Root route - Added to handle direct /api requests
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'ESCDC API Root',
        version: '1.0.0',
        status: 'Routes are active under /api/ members, events, etc.'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        message: 'ESCDC Backend API is running!',
        database: 'MongoDB Atlas',
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

// Test database connection
app.get('/api/test-db', async (req, res) => {
    try {
        const { getDB } = require('./db');
        const db = getDB();
        const collections = await db.listCollections().toArray();

        res.json({
            success: true,
            message: 'Database connection working',
            collections: collections.map(c => c.name)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database error',
            error: error.message
        });
    }
});

// Test members collection structure
app.get('/api/test-members-table', async (req, res) => {
    try {
        const { getDB } = require('./db');
        const db = getDB();
        const members = await db.collection('members').findOne();

        res.json({
            success: true,
            message: 'Members collection structure',
            sampleDocument: members
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking members collection',
            error: error.message
        });
    }
});

// 404 Handler - Catch all other routes
app.use((req, res) => {
    const isApiRoute = req.url.startsWith('/api');
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.url}`,
        error: isApiRoute ? 'API Route not found' : 'Page not found',
        hint: isApiRoute ? 'Check if the endpoint is correctly spelled and prefixed with /api' : 'Try visiting /api for available endpoints'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Using MongoDB Atlas`);
});