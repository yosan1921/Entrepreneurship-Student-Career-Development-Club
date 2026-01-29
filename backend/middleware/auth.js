const jwt = require('jsonwebtoken');
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');

// Verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const secret = process.env.JWT_SECRET;

    console.log('🔍 [AuthMiddleware] Auth Header:', authHeader ? 'Present' : 'Missing');
    if (!secret) {
        console.error('❌ [AuthMiddleware] JWT_SECRET is not defined in environment!');
    }

    const token = authHeader?.replace('Bearer ', '');
    if (token) {
        console.log('🔍 [AuthMiddleware] Token (first 10 chars):', token.substring(0, 10) + '...');
    }

    if (!token) {
        console.warn('❌ No token found in Authorization header');
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log('✅ Token verified for user ID:', decoded.id);
        next();
    } catch (error) {
        console.error('❌ Token verification failed:', error.message);
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
            console.error('❌ User not found or inactive in database for ID:', req.user.id);
            return res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
        }

        console.log('✅ Current user retrieved:', user.username);
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