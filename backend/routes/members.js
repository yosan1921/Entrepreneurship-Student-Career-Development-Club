const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

// Register new member (public)
router.post('/register', async (req, res) => {
    console.log('👤 POST /api/members/register called');
    console.log('📝 Request body received:', JSON.stringify(req.body, null, 2));

    try {
        const db = getDB();
        const membersCollection = db.collection('members');

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

        // Validate required fields
        if (!memberFullName || memberFullName.trim() === '' || !email || email.trim() === '') {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Full name and email are required'
            });
        }

        // Check if member already exists
        const existingMember = await membersCollection.findOne({ email });
        if (existingMember) {
            console.log('Member already exists with email:', email);
            return res.status(400).json({
                success: false,
                message: 'Member with this email already exists'
            });
        }

        // Insert new member
        const newMember = {
            full_name: memberFullName,
            email,
            department: memberDepartment || null,
            phone: phone || null,
            student_id: memberStudentId || null,
            year: year || null,
            interests: interests || null,
            status: 'active',
            joined_at: new Date(),
            created_at: new Date(),
            updated_at: new Date()
        };

        const result = await membersCollection.insertOne(newMember);
        console.log('✅ Member registered with ID:', result.insertedId);

        res.status(201).json({
            success: true,
            message: 'Member registered successfully',
            memberId: result.insertedId
        });
    } catch (error) {
        console.error('Register member error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering member: ' + error.message
        });
    }
});

// Alternative registration endpoint
router.post('/', async (req, res) => {
    console.log('👤 POST /api/members called');
    console.log('📝 Request body received:', JSON.stringify(req.body, null, 2));

    if (!req.body || Object.keys(req.body).length === 0) {
        console.log('❌ Empty request body');
        return res.status(400).json({
            success: false,
            message: 'Request body is required'
        });
    }

    try {
        const db = getDB();
        const membersCollection = db.collection('members');

        const { fullName, full_name, email, department, phone, studentId, student_id, year, interests, firstName, lastName, program } = req.body;

        let memberFullName = fullName || full_name;
        if (!memberFullName && firstName && lastName) {
            memberFullName = `${firstName} ${lastName}`.trim();
        }

        const memberStudentId = studentId || student_id;
        const memberDepartment = department || program;

        if (!memberFullName || memberFullName.trim() === '' || !email || email.trim() === '') {
            console.log('❌ Validation failed - missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Full name and email are required'
            });
        }

        const existingMember = await membersCollection.findOne({ email });
        if (existingMember) {
            console.log('Member already exists with email:', email);
            return res.status(400).json({
                success: false,
                message: 'Member with this email already exists'
            });
        }

        const newMember = {
            full_name: memberFullName,
            email,
            department: memberDepartment || null,
            phone: phone || null,
            student_id: memberStudentId || null,
            year: year || null,
            interests: interests || null,
            status: 'active',
            joined_at: new Date(),
            created_at: new Date(),
            updated_at: new Date()
        };

        const result = await membersCollection.insertOne(newMember);
        console.log('✅ Member created with ID:', result.insertedId);

        res.status(201).json({
            success: true,
            message: 'Member created successfully',
            memberId: result.insertedId
        });
    } catch (error) {
        console.error('Create member error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating member: ' + error.message
        });
    }
});

// Test endpoint
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

// Get all members
router.get('/', async (req, res) => {
    console.log('👤 GET /api/members called');

    try {
        const db = getDB();
        const membersCollection = db.collection('members');

        const { status, department, search, limit = 50, offset = 0 } = req.query;
        const query = {};

        if (status) {
            query.status = status;
        }

        if (department) {
            query.department = department;
        }

        if (search) {
            query.$or = [
                { full_name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { student_id: { $regex: search, $options: 'i' } }
            ];
        }

        const members = await membersCollection
            .find(query)
            .sort({ joined_at: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .toArray();

        console.log(`✅ Members found: ${members.length}`);

        // Convert _id to id for compatibility
        const formattedMembers = members.map(member => ({
            ...member,
            id: member._id,
            _id: undefined
        }));

        res.json({
            success: true,
            count: formattedMembers.length,
            members: formattedMembers
        });
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching members: ' + error.message
        });
    }
});

// Get member by ID
router.get('/:id', async (req, res) => {
    console.log('👤 GET /api/members/:id called');

    try {
        const db = getDB();
        const membersCollection = db.collection('members');
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid member ID'
            });
        }

        const member = await membersCollection.findOne({ _id: new ObjectId(id) });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        console.log('✅ Member found:', member.full_name);

        res.json({
            success: true,
            member: {
                ...member,
                id: member._id,
                _id: undefined
            }
        });
    } catch (error) {
        console.error('Get member error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching member: ' + error.message
        });
    }
});

// Update member
router.put('/:id', async (req, res) => {
    console.log('👤 PUT /api/members/:id called');

    try {
        const db = getDB();
        const membersCollection = db.collection('members');
        const { id } = req.params;
        const { fullName, email, department, phone, studentId, year, status } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid member ID'
            });
        }

        if (!fullName || !email) {
            return res.status(400).json({
                success: false,
                message: 'Full name and email are required'
            });
        }

        const updateData = {
            full_name: fullName,
            email,
            department: department || null,
            phone: phone || null,
            student_id: studentId || null,
            year: year || null,
            status: status || 'active',
            updated_at: new Date()
        };

        const result = await membersCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        console.log('✅ Member updated');

        res.json({
            success: true,
            message: 'Member updated successfully'
        });
    } catch (error) {
        console.error('Update member error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating member: ' + error.message
        });
    }
});

// Delete member
router.delete('/:id', async (req, res) => {
    console.log('👤 DELETE /api/members/:id called');

    try {
        const db = getDB();
        const membersCollection = db.collection('members');
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid member ID'
            });
        }

        const result = await membersCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Member not found'
            });
        }

        console.log('✅ Member deleted');

        res.json({
            success: true,
            message: 'Member deleted successfully'
        });
    } catch (error) {
        console.error('Delete member error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting member: ' + error.message
        });
    }
});

module.exports = router;
