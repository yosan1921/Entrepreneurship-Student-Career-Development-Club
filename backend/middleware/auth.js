const jwt = require('jsonwebtoken');
const db = require('../db');

// Verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

// Check if user has required role
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions.'
            });
        }

        next();
    };
};

// Get user from database and attach to request
const getCurrentUser = (req, res, next) => {
    if (!req.user) {
        return next();
    }

    const query = 'SELECT id, username, email, firstName, lastName, role, status, lastLogin FROM admin_users WHERE id = ? AND status = "active"';

    db.query(query, [req.user.id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database error'
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        req.currentUser = results[0];
        next();
    });
};

module.exports = {
    verifyToken,
    requireRole,
    getCurrentUser
};