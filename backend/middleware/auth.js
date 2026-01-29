const jwt = require('jsonwebtoken');
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

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
const getCurrentUser = async (req, res, next) => {
    if (!req.user) {
        return next();
    }

    try {
        const db = getDB();
        const usersCollection = db.collection('admin_users');

        const user = await usersCollection.findOne(
            { _id: new ObjectId(req.user.id), status: 'active' },
            { projection: { password: 0, resetToken: 0, resetTokenExpiry: 0 } }
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        req.currentUser = {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
            lastLogin: user.lastLogin
        };
        next();
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Database error'
        });
    }
};

module.exports = {
    verifyToken,
    requireRole,
    getCurrentUser
};