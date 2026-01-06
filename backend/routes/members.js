const express = require('express');
const router = express.Router();
const db = require('../db');

// Function to ensure members table exists
const ensureMembersTable = () => {
    return new Promise((resolve, reject) => {
        // Check if table exists first
        const checkTableQuery = `
            SELECT COUNT(*) as tableExists 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() AND table_name = 'members'
        `;

        db.query(checkTableQuery, (err, results) => {
            if (err) {
                console.error('Error checking members table:', err);
                reject(err);
                return;
            }

            const tableExists = results[0].tableExists > 0;
            if (tableExists) {
                console.log('✅ Members table exists');
                resolve();
                return;
            }

            console.log('📋 Creating members table...');
            // Create table if it doesn't exist - matching existing structure
            const createTableSQL = `
                CREATE TABLE members (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    full_name VARCHAR(100) NOT NULL,
                    student_id VARCHAR(50) UNIQUE DEFAULT NULL,
                    department VARCHAR(100) DEFAULT NULL,
                    year INT DEFAULT NULL,
                    phone VARCHAR(20) DEFAULT NULL,
                    email VARCHAR(150) DEFAULT NULL,
                    interests TEXT DEFAULT NULL,
                    status ENUM('active', 'inactive') DEFAULT 'active',
                    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    
                    INDEX idx_email (email),
                    INDEX idx_status (status),
                    INDEX idx_department (department)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `;

            db.query(createTableSQL, (err) => {
                if (err) {
                    console.error('Error creating members table:', err);
                    reject(err);
                } else {
                    console.log('✅ Members table created successfully');

                    // Insert sample data
                    const sampleData = [
                        ['John Doe', 'john.doe@student.haramaya.edu.et', 'Computer Science', '+251911123456', 'CS001', '3rd Year'],
                        ['Jane Smith', 'jane.smith@student.haramaya.edu.et', 'Business Administration', '+251911234567', 'BA002', '2nd Year'],
                        ['Mike Johnson', 'mike.johnson@student.haramaya.edu.et', 'Engineering', '+251911345678', 'ENG003', '4th Year'],
                        ['Sarah Wilson', 'sarah.wilson@student.haramaya.edu.et', 'Economics', '+251911456789', 'ECO004', '1st Year']
                    ];

                    const insertQuery = 'INSERT INTO members (full_name, email, department, phone, student_id, year) VALUES ?';

                    db.query(insertQuery, [sampleData], (insertErr) => {
                        if (insertErr) {
                            console.error('Error inserting sample members:', insertErr);
                        } else {
                            console.log('✅ Sample members inserted');
                        }
                        resolve();
                    });
                }
            });
        });
    });
};

// Function to add interests column if it doesn't exist
const migrateInterestsColumn = () => {
    return new Promise((resolve, reject) => {
        const checkColumnQuery = `
            SELECT COUNT(*) as columnExists 
            FROM information_schema.columns 
            WHERE table_schema = DATABASE() AND table_name = 'members' AND column_name = 'interests'
        `;

        db.query(checkColumnQuery, (err, results) => {
            if (err) {
                console.error('Error checking interests column:', err);
                reject(err);
                return;
            }

            if (results[0].columnExists > 0) {
                console.log('✅ Interests column already exists');
                resolve();
                return;
            }

            console.log('📋 Adding interests column to members table...');
            const alterTableSQL = 'ALTER TABLE members ADD COLUMN interests TEXT DEFAULT NULL AFTER email';

            db.query(alterTableSQL, (err) => {
                if (err) {
                    console.error('Error adding interests column:', err);
                    reject(err);
                } else {
                    console.log('✅ Interests column added successfully');
                    resolve();
                }
            });
        });
    });
};

// Initialize table on module load
ensureMembersTable()
    .then(() => migrateInterestsColumn())
    .catch(err => {
        console.error('Failed to initialize members table:', err);
    });

// Register new member (public)
router.post('/register', async (req, res) => {
    console.log('👤 POST /api/members/register called');
    console.log('📝 Request body received:', JSON.stringify(req.body, null, 2));

    try {
        await ensureMembersTable();

        const { fullName, full_name, email, department, phone, studentId, student_id, year, interests, firstName, lastName, program } = req.body;

        // Handle both camelCase and snake_case field names for compatibility
        let memberFullName = fullName || full_name;
        if (!memberFullName && firstName && lastName) {
            memberFullName = `${firstName} ${lastName}`.trim();
        }

        const memberStudentId = studentId || student_id;
        const memberDepartment = department || program;

        console.log('📋 Extracted values:', {
            memberFullName,
            email,
            memberDepartment,
            phone,
            memberStudentId,
            year,
            interests
        });

        // Validate required fields (check for empty strings and null/undefined)
        if (!memberFullName || memberFullName.trim() === '' || !email || email.trim() === '') {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Full name and email are required'
            });
        }

        console.log('Registering member:', { fullName: memberFullName, email, department: memberDepartment });

        // Check if member already exists
        const checkQuery = 'SELECT * FROM members WHERE email = ?';
        db.query(checkQuery, [email], (err, results) => {
            if (err) {
                console.error('Database check error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error during email check',
                    error: err.message
                });
            }

            if (results.length > 0) {
                console.log('Member already exists with email:', email);
                return res.status(400).json({
                    success: false,
                    message: 'Member with this email already exists'
                });
            }

            // Insert new member - using correct column names from database
            const insertQuery = 'INSERT INTO members (full_name, email, department, phone, student_id, year, interests) VALUES (?, ?, ?, ?, ?, ?, ?)';
            db.query(insertQuery, [memberFullName, email, memberDepartment, phone, memberStudentId, year, interests], (err, result) => {
                if (err) {
                    console.error('Insert error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error registering member',
                        error: err.message
                    });
                }

                console.log('✅ Member registered with ID:', result.insertId);

                res.status(201).json({
                    success: true,
                    message: 'Member registered successfully',
                    memberId: result.insertId
                });
            });
        });
    } catch (error) {
        console.error('Register member table initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

// Alternative registration endpoint
router.post('/', async (req, res) => {
    console.log('👤 POST /api/members called');
    console.log('📝 Request body received:', JSON.stringify(req.body, null, 2));

    // Check if request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
        console.log('❌ Empty request body');
        return res.status(400).json({
            success: false,
            message: 'Request body is required'
        });
    }

    try {
        await ensureMembersTable();

        const { fullName, full_name, email, department, phone, studentId, student_id, year, interests, firstName, lastName, program } = req.body;

        // Handle both camelCase and snake_case field names for compatibility
        let memberFullName = fullName || full_name;
        if (!memberFullName && firstName && lastName) {
            memberFullName = `${firstName} ${lastName}`.trim();
        }

        const memberStudentId = studentId || student_id;
        const memberDepartment = department || program;

        console.log('📋 Extracted values:', {
            memberFullName,
            email,
            memberDepartment,
            phone,
            memberStudentId,
            year,
            interests
        });

        // Validate required fields (check for empty strings and null/undefined)
        if (!memberFullName || memberFullName.trim() === '' || !email || email.trim() === '') {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Full name and email are required'
            });
        }

        console.log('Creating member:', { fullName: memberFullName, email, department: memberDepartment });

        // Check if member already exists
        const checkQuery = 'SELECT * FROM members WHERE email = ?';
        db.query(checkQuery, [email], (err, results) => {
            if (err) {
                console.error('Database check error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error during email check',
                    error: err.message
                });
            }

            if (results.length > 0) {
                console.log('Member already exists with email:', email);
                return res.status(400).json({
                    success: false,
                    message: 'Member with this email already exists'
                });
            }

            // Insert new member - using correct column names from database
            const insertQuery = 'INSERT INTO members (full_name, email, department, phone, student_id, year, interests) VALUES (?, ?, ?, ?, ?, ?, ?)';
            db.query(insertQuery, [memberFullName, email, memberDepartment, phone, memberStudentId, year, interests], (err, result) => {
                if (err) {
                    console.error('Insert error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Error creating member',
                        error: err.message
                    });
                }

                console.log('✅ Member created with ID:', result.insertId);

                res.status(201).json({
                    success: true,
                    message: 'Member created successfully',
                    memberId: result.insertId
                });
            });
        });
    } catch (error) {
        console.error('Create member table initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

// Test endpoint to debug the issue
router.post('/test', (req, res) => {
    console.log('🧪 POST /api/members/test called');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    console.log('📝 Headers:', JSON.stringify(req.headers, null, 2));

    res.json({
        success: true,
        message: 'Test endpoint working',
        receivedData: req.body,
        timestamp: new Date().toISOString()
    });
});

// Get all members (no auth for testing)
router.get('/', async (req, res) => {
    console.log('👤 GET /api/members called');

    try {
        await ensureMembersTable();

        const { status, department, search, limit = 50, offset = 0 } = req.query;
        let query = 'SELECT * FROM members WHERE 1=1';
        let params = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (department) {
            query += ' AND department = ?';
            params.push(department);
        }

        if (search) {
            query += ' AND (full_name LIKE ? OR email LIKE ? OR student_id LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY joined_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        console.log('👤 Query:', query);
        console.log('👤 Params:', params);

        db.query(query, params, (err, results) => {
            if (err) {
                console.error('Members DB Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching members',
                    error: err.message
                });
            }

            console.log(`✅ Members found: ${results.length}`);

            res.json({
                success: true,
                count: results.length,
                members: results
            });
        });
    } catch (error) {
        console.error('Get members table initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

// Get member by ID (no auth for testing)
router.get('/:id', async (req, res) => {
    console.log('👤 GET /api/members/:id called');

    try {
        await ensureMembersTable();

        const { id } = req.params;
        const query = 'SELECT * FROM members WHERE id = ?';

        console.log('👤 Get by ID Query:', query, 'ID:', id);

        db.query(query, [id], (err, results) => {
            if (err) {
                console.error('Get Member DB Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching member',
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }

            console.log('✅ Member found:', results[0].full_name);

            res.json({
                success: true,
                member: results[0]
            });
        });
    } catch (error) {
        console.error('Get member table initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

// Update member (no auth for testing)
router.put('/:id', async (req, res) => {
    console.log('👤 PUT /api/members/:id called');

    try {
        await ensureMembersTable();

        const { id } = req.params;
        const { fullName, email, department, phone, studentId, year, status } = req.body;

        if (!fullName || !email) {
            return res.status(400).json({
                success: false,
                message: 'Full name and email are required'
            });
        }

        const query = 'UPDATE members SET full_name = ?, email = ?, department = ?, phone = ?, student_id = ?, year = ?, status = ? WHERE id = ?';
        const params = [fullName, email, department, phone, studentId, year, status || 'active', id];

        console.log('👤 Update Query:', query);
        console.log('👤 Update Params:', params);

        db.query(query, params, (err, result) => {
            if (err) {
                console.error('Update Member DB Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error updating member',
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }

            console.log('✅ Member updated, affected rows:', result.affectedRows);

            res.json({
                success: true,
                message: 'Member updated successfully'
            });
        });
    } catch (error) {
        console.error('Update member table initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

// Delete member (no auth for testing)
router.delete('/:id', async (req, res) => {
    console.log('👤 DELETE /api/members/:id called');

    try {
        await ensureMembersTable();

        const { id } = req.params;
        const query = 'DELETE FROM members WHERE id = ?';

        console.log('👤 Delete Query:', query, 'ID:', id);

        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Delete Member DB Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error deleting member',
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found'
                });
            }

            console.log('✅ Member deleted, affected rows:', result.affectedRows);

            res.json({
                success: true,
                message: 'Member deleted successfully'
            });
        });
    } catch (error) {
        console.error('Delete member table initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Database initialization error: ' + error.message
        });
    }
});

module.exports = router;