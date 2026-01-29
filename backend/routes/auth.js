const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const router = express.Router();
const { getDB } = require('../db');
const { ObjectId } = require('mongodb');
const { verifyToken, getCurrentUser } = require('../middleware/auth');

// Email transporter setup
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log('🔐 Login attempt:', { username, hasPassword: !!password });

    if (!username || !password) {
        console.log('❌ Missing credentials');
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }

    try {
        const db = getDB();
        const usersCollection = db.collection('admin_users');

        const user = await usersCollection.findOne({
            $or: [
                { username: username },
                { email: username }
            ],
            status: 'active'
        });

        console.log(`📊 Found user:`, user ? 'Yes' : 'No');

        if (!user) {
            console.log('❌ No user found with username/email:', username);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log('👤 User found:', { id: user._id, username: user.username, role: user.role, status: user.status });

        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log('🔑 Password validation:', isValidPassword);

        if (!isValidPassword) {
            console.log('❌ Invalid password for user:', username);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        await usersCollection.updateOne(
            { _id: user._id },
            { $set: { lastLogin: new Date() } }
        );

        if (!process.env.JWT_SECRET) {
            console.error('❌ [AuthRoute] JWT_SECRET is not defined in environment during token signing!');
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id.toString(),
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        console.log('✅ Login successful for user:', username);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
});

// Get current user profile
router.get('/profile', verifyToken, getCurrentUser, (req, res) => {
    res.json({
        success: true,
        user: req.currentUser
    });
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email is required'
        });
    }

    try {
        const db = getDB();
        const usersCollection = db.collection('admin_users');

        const user = await usersCollection.findOne({
            email: email,
            status: 'active'
        });

        if (!user) {
            // Don't reveal if email exists or not for security
            return res.json({
                success: true,
                message: 'If the email exists, a reset link has been sent'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    resetToken: resetToken,
                    resetTokenExpiry: resetTokenExpiry
                }
            }
        );

        // Send email (if email is configured)
        try {
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                const transporter = createTransporter();

                const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;

                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'ESCDC - Password Reset Request',
                    html: `
                        <h2>Password Reset Request</h2>
                        <p>Hello ${user.firstName},</p>
                        <p>You requested a password reset for your ESCDC admin account.</p>
                        <p>Click the link below to reset your password:</p>
                        <a href="${resetUrl}" style="background: #0b4ea2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                        <p>This link will expire in 1 hour.</p>
                        <p>If you didn't request this, please ignore this email.</p>
                    `
                });
            }

            res.json({
                success: true,
                message: 'If the email exists, a reset link has been sent',
                resetToken: resetToken // Remove this in production
            });

        } catch (emailError) {
            console.error('Email error:', emailError);
            res.json({
                success: true,
                message: 'Reset token generated (email not configured)',
                resetToken: resetToken // For development only
            });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing request'
        });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Token and new password are required'
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long'
        });
    }

    try {
        const db = getDB();
        const usersCollection = db.collection('admin_users');

        const user = await usersCollection.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() },
            status: 'active'
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: { password: hashedPassword },
                $unset: { resetToken: '', resetTokenExpiry: '' }
            }
        );

        res.json({
            success: true,
            message: 'Password reset successful'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password'
        });
    }
});

// Change password (for logged-in users)
router.post('/change-password', verifyToken, getCurrentUser, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Current password and new password are required'
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'New password must be at least 6 characters long'
        });
    }

    try {
        const db = getDB();
        const usersCollection = db.collection('admin_users');

        const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);

        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await usersCollection.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
        );

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password'
        });
    }
});

// Logout (client-side token removal, but we can log it)
router.post('/logout', verifyToken, (req, res) => {
    console.log(`User ${req.user.username} logged out`);

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;
