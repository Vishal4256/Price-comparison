const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendResetLink } = require('../services/emailService');
const crypto = require('crypto');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password });
        const token = jwt.sign({ id: user._id, tokenVersion: user.tokenVersion || 0 }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        // Update last login
        if (user) {
            user.lastLogin = Date.now();
            await user.save({ validateBeforeSave: false });
        }

        if (user && (await user.comparePassword(password))) {
            const token = jwt.sign({ id: user._id, tokenVersion: user.tokenVersion || 0 }, process.env.JWT_SECRET, { expiresIn: '30d' });
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate a secure random token
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Hash and store the token, set expiration to 10 minutes
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

        const emailSent = await sendResetLink({ toEmail: email, userName: user.name, resetUrl });
        if (emailSent.success) {
            res.json({ message: 'Password reset link sent to your email.' });
        } else {
            // Dev fallback: if email fails, log the reset URL to the terminal and return a devFallback success response
            if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
                console.log(`\n==========================================`);
                console.log(`⚠️  EMAIL SEND FAILED: ${emailSent.error}`);
                console.log(`🔑 DEV FALLBACK RESET LINK: ${resetUrl}`);
                console.log(`==========================================\n`);
                return res.json({ 
                    message: 'Reset link generated successfully (Dev Mode Fallback: Click the link logged in your backend terminal console)',
                    resetUrl,
                    devFallback: true 
                });
            }
            res.status(500).json({ message: `Failed to send email: ${emailSent.error || 'Unknown error'}` });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token) return res.status(400).json({ message: 'Reset token is required.' });

        // Hash token to compare with database token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired password reset link.' });

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: 'Password reset successful.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: 'Verification token is required.' });

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            verificationToken: hashedToken,
            verificationTokenExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired verification link.' });

        user.isEmailVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resendVerificationEmail = async (req, res) => {
    try {
        // user is already attached from protect middleware
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email is already verified.' });
        }

        const verificationToken = crypto.randomBytes(20).toString('hex');
        user.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await user.save();

        const { sendVerificationEmail } = require('../utils/emailService');
        await sendVerificationEmail(user.email, verificationToken);

        res.json({ message: 'Verification email sent successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
