const express = require('express');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

// Get all events (public)
router.get('/', async (req, res) => {
    console.log('📅 GET /api/events called');

    try {
        const db = getDB();
        const eventsCollection = db.collection('events');

        const { status, category, limit = 50, offset = 0 } = req.query;
        const query = {};

        if (status) {
            query.status = status;
        }

        if (category) {
            query.category = category;
        }

        const events = await eventsCollection
            .find(query)
            .sort({ datetime: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset))
            .toArray();

        console.log(`✅ Events found: ${events.length}`);

        const formattedEvents = events.map(event => ({
            ...event,
            id: event._id,
            _id: undefined
        }));

        res.json({
            success: true,
            count: formattedEvents.length,
            events: formattedEvents
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events: ' + error.message
        });
    }
});

// Get upcoming events (public)
router.get('/upcoming', async (req, res) => {
    console.log('📅 GET /api/events/upcoming called');

    try {
        const db = getDB();
        const eventsCollection = db.collection('events');

        const events = await eventsCollection
            .find({
                status: 'upcoming',
                datetime: { $gte: new Date() }
            })
            .sort({ datetime: 1 })
            .toArray();

        console.log(`✅ Upcoming events found: ${events.length}`);

        const formattedEvents = events.map(event => ({
            ...event,
            id: event._id,
            _id: undefined
        }));

        res.json({
            success: true,
            count: formattedEvents.length,
            events: formattedEvents
        });
    } catch (error) {
        console.error('Get upcoming events error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching upcoming events: ' + error.message
        });
    }
});

// Get event by ID (public)
router.get('/:id', async (req, res) => {
    console.log('📅 GET /api/events/:id called');

    try {
        const db = getDB();
        const eventsCollection = db.collection('events');
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID'
            });
        }

        const event = await eventsCollection.findOne({ _id: new ObjectId(id) });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        console.log('✅ Event found:', event.title);

        res.json({
            success: true,
            event: {
                ...event,
                id: event._id,
                _id: undefined
            }
        });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching event: ' + error.message
        });
    }
});

// Create event
router.post('/', async (req, res) => {
    console.log('📅 POST /api/events called');

    try {
        const db = getDB();
        const eventsCollection = db.collection('events');

        const { title, description, category, datetime, location, organizer, maxParticipants, status } = req.body;

        if (!title || !description || !datetime || !location) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, datetime, and location are required'
            });
        }

        const newEvent = {
            title,
            description,
            category: category || 'General',
            datetime: new Date(datetime),
            location,
            organizer: organizer || 'ESCDC',
            maxParticipants: maxParticipants || null,
            status: status || 'upcoming',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await eventsCollection.insertOne(newEvent);
        console.log('✅ Event created with ID:', result.insertedId);

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            id: result.insertedId
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating event: ' + error.message
        });
    }
});

// Update event
router.put('/:id', async (req, res) => {
    console.log('📅 PUT /api/events/:id called');

    try {
        const db = getDB();
        const eventsCollection = db.collection('events');
        const { id } = req.params;
        const { title, description, category, datetime, location, organizer, maxParticipants, status } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID'
            });
        }

        if (!title || !description || !datetime || !location) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, datetime, and location are required'
            });
        }

        const updateData = {
            title,
            description,
            category,
            datetime: new Date(datetime),
            location,
            organizer,
            maxParticipants,
            status,
            updatedAt: new Date()
        };

        const result = await eventsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        console.log('✅ Event updated');

        res.json({
            success: true,
            message: 'Event updated successfully'
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating event: ' + error.message
        });
    }
});

// Delete event
router.delete('/:id', async (req, res) => {
    console.log('📅 DELETE /api/events/:id called');

    try {
        const db = getDB();
        const eventsCollection = db.collection('events');
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid event ID'
            });
        }

        const result = await eventsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        console.log('✅ Event deleted');

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting event: ' + error.message
        });
    }
});

module.exports = router;
