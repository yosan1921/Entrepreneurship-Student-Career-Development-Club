const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

// Submit contact form
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const db = getDB();

        const newContact = {
            name,
            email,
            subject,
            message,
            status: 'new',
            submittedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('contacts').insertOne(newContact);

        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully',
            contact: {
                id: result.insertedId,
                name,
                email,
                subject
            }
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error submitting contact form',
            error: err.message
        });
    }
});

// Get all contact submissions
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const results = await db.collection('contacts')
            .find({})
            .sort({ submittedAt: -1 })
            .toArray();

        res.json({
            success: true,
            count: results.length,
            contacts: results.map(c => ({ ...c, id: c._id }))
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error fetching contact submissions',
            error: err.message
        });
    }
});

// Update contact status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid contact ID'
            });
        }

        const db = getDB();
        const result = await db.collection('contacts').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact status updated'
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error updating contact status',
            error: err.message
        });
    }
});

// Delete contact message
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid contact ID'
            });
        }

        const db = getDB();
        const result = await db.collection('contacts').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact message deleted successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error deleting contact message',
            error: err.message
        });
    }
});

// Reply to contact message
router.post('/:id/reply', async (req, res) => {
    try {
        const { replyMessage } = req.body;
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid contact ID'
            });
        }

        const db = getDB();

        // First, get the contact details
        const contact = await db.collection('contacts').findOne({ _id: new ObjectId(id) });

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        // Update the contact status to 'replied' and store the reply
        await db.collection('contacts').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: 'replied',
                    reply: replyMessage,
                    repliedAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );

        // In a real application, you would send an email here
        // For now, we'll just return success
        res.json({
            success: true,
            message: 'Reply sent successfully',
            data: {
                contactEmail: contact.email,
                contactName: contact.name,
                replyMessage: replyMessage
            }
        });
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).json({
            success: false,
            message: 'Error saving reply',
            error: err.message
        });
    }
});

module.exports = router;

module.exports = router;