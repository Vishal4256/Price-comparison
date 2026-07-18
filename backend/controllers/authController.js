const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const generateTokens = async (user, res) => {
    const accessToken = jwt.sign(
        { id: user._id, tokenVersion: user.tokenVersion || 0 }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRE || '7d' } // Use env-configured expiry
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    user.refreshTokenHash = refreshTokenHash;
    await user.save({ validateBeforeSave: false });

    // Set secure cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return accessToken;
};

exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Input Validation
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name must be at least 2 characters' } });
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Please provide a valid email address' } });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!password || !passwordRegex.test(password)) {
            return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.' } });
        }

        const userExists = await User.findOne({ email });
        
        if (userExists) {
            return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email already exists' } });
        }

        const user = await User.create({ name, email, password });
        const token = await generateTokens(user, res);

        res.status(201).json({ 
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, error: { code: 'AUTH_FAILED', message: 'Invalid email or password' } });
        }

        user.lastLogin = Date.now();
        const token = await generateTokens(user, res);
        
        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token,
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            return res.status(401).json({ success: false, error: { code: 'AUTH_FAILED', message: 'No refresh token provided' } });
        }

        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        
        const user = await User.findOne({ refreshTokenHash });
        if (!user) {
            return res.status(401).json({ success: false, error: { code: 'AUTH_FAILED', message: 'Invalid or revoked refresh token' } });
        }

        // Generate new tokens (Rotation)
        const token = await generateTokens(user, res);

        res.status(200).json({
            success: true,
            data: { token }
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        res.clearCookie('refreshToken');
        
        if (req.user) {
            // Revoke in DB
            req.user.refreshTokenHash = undefined;
            await req.user.save({ validateBeforeSave: false });
        }
        
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // Return 200 even if not found to prevent email enumeration
            return res.status(200).json({ message: 'If that email exists, a reset link has been generated.' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // Set expire (10 minutes)
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save({ validateBeforeSave: false });

        // Generate reset URL
        // In a real app, send via email. Here, we'll return it in the response for dev testing.
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        
        console.log(`[AUTH] Password reset link for ${email}: ${resetUrl}`);

        res.status(200).json({ 
            message: 'If that email exists, a reset link has been generated.',
            dev_note: `In production this goes to email. Click here to test: ${resetUrl}`,
            resetUrl: resetUrl 
        });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Strict password validation
        const { password } = req.body;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                message: 'Password must be at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.' 
            });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        // Optionally bump tokenVersion so other devices get logged out when password is changed
        user.tokenVersion += 1; 

        await user.save();

        res.status(200).json({ message: 'Password reset successful. You can now login.' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: error.message });
    }
};
