const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, requireRole, getCurrentUser } = require('../middleware/auth');

// ================== PUBLIC ROUTES ==================

// Get all active categories
router.get('/', (req, res) => {
    const query = `
        SELECT rc.*, COUNT(r.id) as resource_count
        FROM resource_categories rc
        LEFT JOIN resources r ON rc.id = r.category_id AND r.status = 'active'
        WHERE rc.status = 'active'
        GROUP BY rc.id
        ORDER BY rc.display_order ASC, rc.name ASC
    `;
    
    db.query(query, (err, results) 