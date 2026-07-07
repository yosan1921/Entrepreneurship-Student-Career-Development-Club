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

// Get current user profile — works for both admin and member tokens
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const db = getDB();
        if (req.user.role === 'member') {
            const member = await db.collection('members').findOne(
                { _id: new ObjectId(req.user.id) },
                { projection: { password: 0 } }
            );
            if (!member || member.status !== 'active') {
                return res.status(401).json({ success: false, message: 'Account not found or inactive' });
            }
            return res.json({
                success: true,
                user: {
                    id: member._id,
                    username: member.username || null,
                    email: member.email,
                    full_name: member.full_name,
                    firstName: member.full_name?.split(' ')[0] || '',
                    lastName: member.full_name?.split(' ').slice(1).join(' ') || '',
                    department: member.department,
                    student_id: member.student_id,
                    year: member.year,
                    role: 'member'
                }
            });
        }

        // Admin user
        const user = await db.collection('admin_users').findOne(
            { _id: new ObjectId(req.user.id), status: 'active' },
            { projection: { password: 0, resetToken: 0, resetTokenExpiry: 0 } }
        );
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found or inactive' });
        }
        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                status: user.status,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
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

// ================== USER (MEMBER) AUTH ==================

// User login — authenticates against the members collection
router.post('/user-login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
        const db = getDB();
        const member = await db.collection('members').findOne({
            email: email.toLowerCase().trim(),
            status: 'active'
        });

        if (!member) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!member.password) {
            return res.status(401).json({
                success: false,
                message: 'No password set for this account. Please register to set a password.'
            });
        }

        const isValid = await bcrypt.compare(password, member.password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Update last login
        await db.collection('members').updateOne(
            { _id: member._id },
            { $set: { lastLogin: new Date() } }
        );

        const token = jwt.sign(
            { id: member._id.toString(), email: member.email, role: 'member' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: member._id,
                username: member.username || null,
                email: member.email,
                full_name: member.full_name,
                firstName: member.full_name?.split(' ')[0] || '',
                lastName: member.full_name?.split(' ').slice(1).join(' ') || '',
                department: member.department,
                student_id: member.student_id,
                year: member.year,
                role: 'member'
            }
        });
    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({ success: false, message: 'Authentication error' });
    }
});

// User registration with password — creates a member account
router.post('/register', async (req, res) => {
    const { firstName, lastName, username, email, password, studentId, program, year, phone } = req.body;

    // Required field check
    if (!firstName || !lastName || !username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'First name, last name, username, email and password are required'
        });
    }

    // Username format: 3–30 chars, letters/numbers/underscores only
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username.trim())) {
        return res.status(400).json({
            success: false,
            message: 'Username must be 3–30 characters and contain only letters, numbers, or underscores'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    try {
        const db = getDB();
        const cleanUsername = username.trim().toLowerCase();
        const cleanEmail = email.toLowerCase().trim();

        // Username uniqueness — check both admin_users and members
        const [adminByUsername, memberByUsername] = await Promise.all([
            db.collection('admin_users').findOne({ username: cleanUsername }),
            db.collection('members').findOne({ username: cleanUsername })
        ]);
        if (adminByUsername || memberByUsername) {
            return res.status(400).json({ success: false, message: 'This username is already taken. Please choose another.' });
        }

        // Email uniqueness — block if already an admin
        const existingAdmin = await db.collection('admin_users').findOne({ email: cleanEmail });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: 'This email is already registered' });
        }

        const existingMember = await db.collection('members').findOne({ email: cleanEmail });
        if (existingMember) {
            if (existingMember.password) {
                return res.status(400).json({ success: false, message: 'An account with this email already exists' });
            }
            // Member record exists without a password (added by admin) — activate it
            const hashed = await bcrypt.hash(password, 12);
            await db.collection('members').updateOne(
                { _id: existingMember._id },
                { $set: { username: cleanUsername, password: hashed, updated_at: new Date() } }
            );
            return res.json({ success: true, message: 'Account activated successfully. You can now log in.' });
        }

        const hashed = await bcrypt.hash(password, 12);
        const full_name = `${firstName.trim()} ${lastName.trim()}`;

        const newMember = {
            username: cleanUsername,
            full_name,
            email: cleanEmail,
            password: hashed,
            phone: phone?.trim() || null,
            student_id: studentId?.trim() || null,
            department: program?.trim() || null,
            year: year || null,
            status: 'active',
            role: 'member',
            joined_at: new Date(),
            created_at: new Date(),
            updated_at: new Date()
        };

        const result = await db.collection('members').insertOne(newMember);

        res.status(201).json({
            success: true,
            message: 'Account created successfully! You can now log in.',
            memberId: result.insertedId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Error creating account' });
    }
});

// Get user (member) profile
router.get('/user-profile', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'member') {
            return res.status(403).json({ success: false, message: 'Not a member account' });
        }
        const db = getDB();
        const member = await db.collection('members').findOne(
            { _id: new ObjectId(req.user.id) },
            { projection: { password: 0 } }
        );
        if (!member) {
            return res.status(404).json({ success: false, message: 'Member not found' });
        }
        res.json({
            success: true,
            user: {
                id: member._id,
                email: member.email,
                full_name: member.full_name,
                firstName: member.full_name?.split(' ')[0] || '',
                lastName: member.full_name?.split(' ').slice(1).join(' ') || '',
                department: member.department,
                student_id: member.student_id,
                year: member.year,
                role: 'member'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
});

// ================== SHARED ==================

// Logout
router.post('/logout', verifyToken, (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
