const express = require('express');
const router = express.Router();
const db = require('../db');

// Function to ensure events table exists
const ensureEventsTable = () => {
    return new Promise((resolve, reject) => {
        // Check if table exists first
        const checkTableQuery = `
            SELECT COUNT(*) as tableExists 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() AND table_name = 'events'
        `;

        db.query(checkTableQuery, (err, results) => {
            if (err) {
                console.error('Error checking events table:', err);
                reject(err);
                return;
            }

            const tableExists = results[0].tableExists > 0;
            if (tableExists) {
                console.log('✅ Events table exists');
                resolve();
                return;
            }

            console.log('📋 Creating events table...');
            // Create table if it doesn't exist
            const createTableSQL = `
                CREATE TABLE events (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    datetime DATETIME NOT NULL,
                    location VARCHAR(255) NOT NULL,
                    status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
                    organizer VARCHAR(255) NOT NULL,
                    maxParticipants INT NULL,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    
                    INDEX idx_datetime (datetime),
                    INDEX idx_status (status),
                    INDEX idx_category (category)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `;

            db.query(createTableSQL, (err) => {
                if (err) {
                    console.error('Error creating events table:', err);
                    reject(err);
                } else {
                    console.log('✅ Events table created successfully');

                    // Insert sample data
                    const sampleData = [
                        ['React Workshop', 'Learn React fundamentals and build modern web applications', 'Workshop', '2025-01-15 14:00:00', 'Tech Lab', 'upcoming', 'John Doe', 30],
                        ['Career Seminar', 'Professional development session for students', 'Seminar', '2025-01-20 10:00:00', 'Main Hall', 'upcoming', 'Jane Smith', 100],
                        ['Entrepreneurship Bootcamp', 'Intensive training for aspiring entrepreneurs', 'Bootcamp', '2025-01-25 09:00:00', 'Conference Room', 'upcoming', 'Mike Johnson', 50],
                        ['Leadership Training', 'Develop your leadership skills', 'Training', '2025-02-01 13:00:00', 'Training Center', 'upcoming', 'Sarah Wilson', 40]
                    ];

                    const insertQuery = 'INSERT INTO events (title, description, category, datetime, location, status, organizer, maxParticipants) VALUES ?';

                    db.query(insertQuery, [sampleData], (insertErr) => {
                        if (insertErr) {
                            console.error('Error inserting sample events:', insertErr);
                        } else {
                            console.log('✅ Sample events inserted');
                        }
                        resolve();
                    });
                }
            });
        });
    });
};

// Initialize table on module load
ensureEventsTable().catch(err => {
    console.error('Failed to ensure events table exists:', err);
});

// Get all events (public)
router.get('/', async (req, res) => {
    console.log('📅 GET /api/events called');

    try {
        await ensureEventsTable();

        const { status, category, limit = 50, offset = 0 } = req.query;
        let query = 'SELECT * FROM events WHERE 1=1';
        let params = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        query += ' ORDER BY datetime DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        console.log('📅 Query:', query);
        console.log('📅 Params:', params);

        db.query(query, params, (err, results) => {
            if (err) {
                console.error('Events DB Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching events',
                    error: err.message
                });
            }

            console.log(`✅ Events found: ${results.length}`);

            res.json({
                success: true,
                count: results.length,
                events: results
            });
        });
    } catch (error) {
        console.error('Events table initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

// Get upcoming events (public)
router.get('/upcoming', async (req, res) => {
    console.log('📅 GET /api/events/upcoming called');

    try {
        await ensureEventsTable();

        const query = 'SELECT * FROM events WHERE status = "upcoming" AND datetime >= NOW() ORDER BY datetime ASC';

        console.log('📅 Upcoming Query:', query);

        db.query(query, (err, results) => {
            if (err) {
                console.error('Upcoming Events DB Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching upcoming events',
                    error: err.message
                });
            }

            console.log(`✅ Upcoming events found: ${results.length}`);

            res.json({
                success: true,
                count: results.length,
                events: results
            });
        });
    } catch (error) {
        console.error('Upcoming events table initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

// Get event by ID (public)
router.get('/:id', async (req, res) => {
    console.log('📅 GET /api/events/:id called');

    try {
        await ensureEventsTable();

        const { id } = req.params;
        const query = 'SELECT * FROM events WHERE id = ?';

        console.log('📅 Get by ID Query:', query, 'ID:', id);

        db.query(query, [id], (err, results) => {
            if (err) {
                console.error('Get Event DB Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching event',
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }

            console.log('✅ Event found:', results[0].title);

            res.json({
                success: true,
                event: results[0]
            });
        });
    } catch (error) {
        console.error('Get event table initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

// Create event (no auth for testing)
router.post('/', async (req, res) => {
    console.log('📅 POST /api/events called');

    try {
        await ensureEventsTable();

        const { title, description, category, datetime, location, organizer, maxParticipants, status } = req.body;

        if (!title || !description || !datetime || !location) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, datetime, and location are required'
            });
        }

        const query = 'INSERT INTO events (title, description, category, datetime, location, organizer, maxParticipants, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const params = [title, description, category || 'General', datetime, location, organizer || 'ESCDC', maxParticipants, status || 'upcoming'];

        console.log('📅 Create Query:', query);
        console.log('📅 Create Params:', params);

        db.query(query, params, (err, result) => {
            if (err) {
                console.error('Create Event DB Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error creating event',
                    error: err.message
                });
            }

            console.log('✅ Event created with ID:', result.insertId);

            res.status(201).json({
                success: true,
                message: 'Event created successfully',
                id: result.insertId
            });
        });
    } catch (error) {
        console.error('Create event table initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

// Update event (no auth for testing)
router.put('/:id', async (req, res) => {
    console.log('📅 PUT /api/events/:id called');

    try {
        await ensureEventsTable();

        const { id } = req.params;
        const { title, description, category, datetime, location, organizer, maxParticipants, status } = req.body;

        if (!title || !description || !datetime || !location) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, datetime, and location are required'
            });
        }

        const query = 'UPDATE events SET title = ?, description = ?, category = ?, datetime = ?, location = ?, organizer = ?, maxParticipants = ?, status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?';
        const params = [title, description, category, datetime, location, organizer, maxParticipants, status, id];

        console.log('📅 Update Query:', query);
        console.log('📅 Update Params:', params);

        db.query(query, params, (err, result) => {
            if (err) {
                console.error('Update Event DB Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error updating event',
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }

            console.log('✅ Event updated, affected rows:', result.affectedRows);

            res.json({
                success: true,
                message: 'Event updated successfully'
            });
        });
    } catch (error) {
        console.error('Update event table initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

// Delete event (no auth for testing)
router.delete('/:id', async (req, res) => {
    console.log('📅 DELETE /api/events/:id called');

    try {
        await ensureEventsTable();

        const { id } = req.params;
        const query = 'DELETE FROM events WHERE id = ?';

        console.log('📅 Delete Query:', query, 'ID:', id);

        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Delete Event DB Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error deleting event',
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }

            console.log('✅ Event deleted, affected rows:', result.affectedRows);

            res.json({
                success: true,
                message: 'Event deleted successfully'
            });
        });
    } catch (error) {
        console.error('Delete event table initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

module.exports = router;