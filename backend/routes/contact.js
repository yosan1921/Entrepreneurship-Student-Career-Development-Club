const express = require('express');
const router = express.Router();
const db = require('../db');

// Submit contact form
router.post('/', (req, res) => {
    const { name, email, subject, message } = req.body;

    const query = 'INSERT INTO contacts (name, email, subject, message, submittedAt) VALUES (?, ?, ?, ?, NOW())';

    db.query(query, [name, email, subject, message], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error submitting contact form',
                error: err.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully',
            contact: {
                id: result.insertId,
                name,
                email,
                subject
            }
        });
    });
});

// Get all contact submissions
router.get('/', (req, res) => {
    const query = 'SELECT * FROM contacts ORDER BY submittedAt DESC';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching contact submissions',
                error: err.message
            });
        }

        res.json({
            success: true,
            count: results.length,
            contacts: results
        });
    });
});

// Update contact status
router.patch('/:id/status', (req, res) => {
    const { status } = req.body;
    const query = 'UPDATE contacts SET status = ?, updatedAt = NOW() WHERE id = ?';

    db.query(query, [status, req.params.id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error updating contact status',
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact status updated'
        });
    });
});

// Delete contact message
router.delete('/:id', (req, res) => {
    const query = 'DELETE FROM contacts WHERE id = ?';

    db.query(query, [req.params.id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error deleting contact message',
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact message deleted successfully'
        });
    });
});

// Reply to contact message
router.post('/:id/reply', (req, res) => {
    const { replyMessage } = req.body;
    const contactId = req.params.id;

    // First, get the contact details
    const getContactQuery = 'SELECT * FROM contacts WHERE id = ?';

    db.query(getContactQuery, [contactId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Error fetching contact details',
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        const contact = results[0];

        // Update the contact status to 'replied' and store the reply
        const updateQuery = 'UPDATE contacts SET status = ?, reply = ?, repliedAt = NOW(), updatedAt = NOW() WHERE id = ?';

        db.query(updateQuery, ['replied', replyMessage, contactId], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Error saving reply',
                    error: err.message
                });
            }

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
        });
    });
});

module.exports = router;