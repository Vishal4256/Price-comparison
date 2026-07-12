const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendVerificationOTP, sendResetLink } = require('../services/emailService');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Helper to generate a 6 digit numeric OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        
        if (userExists) {
            // If user exists but is not verified, we can resend OTP here or just return error
            // For security, just say user already exists
            return res.status(400).json({ message: 'Email already exists' });
        }

        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

        const user = await User.create({ 
            name, 
            email, 
            password,
            isVerified: false,
            otpHash,
            otpExpiry,
            lastOtpSentAt: Date.now()
        });

        // Send OTP email
        const emailSent = await sendVerificationOTP(email, name, otp);
        if (!emailSent.success) {
            console.error('Failed to send OTP on register:', emailSent.error);
            // We still created the user, they can try resend
        }
        
        // Log in terminal for dev
        if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
            console.log(`\n==========================================`);
            console.log(`🔑 DEV OTP: ${otp} for ${email}`);
            console.log(`==========================================\n`);
        }

        res.status(201).json({ message: 'OTP sent successfully', email: user.email });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        // Check if locked out (5 attempts)
        if (user.otpAttempts >= 5) {
            // Wait 15 minutes
            if (Date.now() < user.otpExpiry.getTime() + 15 * 60 * 1000) {
                return res.status(429).json({ message: 'Too many attempts. Please try again after 15 minutes.' });
            } else {
                // Reset attempts if lockout period passed
                user.otpAttempts = 0;
                await user.save();
            }
        }

        if (!user.otpHash || !user.otpExpiry) {
            return res.status(400).json({ message: 'No OTP requested' });
        }

        if (Date.now() > user.otpExpiry) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        const isMatch = await bcrypt.compare(otp, user.otpHash);
        if (!isMatch) {
            user.otpAttempts += 1;
            await user.save();
            return res.status(400).json({ message: 'OTP incorrect' });
        }

        // Success
        user.isVerified = true;
        user.otpHash = undefined;
        user.otpExpiry = undefined;
        user.otpAttempts = 0;
        user.otpResendCount = 0;
        user.lastOtpSentAt = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id, tokenVersion: user.tokenVersion || 0 }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.json({
            message: 'Email verified successfully',
            _id: user._id,
            name: user.name,
            email: user.email,
            token,
        });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        const now = Date.now();

        // 60 seconds cooldown
        if (user.lastOtpSentAt && now < user.lastOtpSentAt.getTime() + 60 * 1000) {
            return res.status(429).json({ message: 'Please wait 60 seconds before requesting another OTP' });
        }

        // 5 requests per hour rate limit
        if (!user.otpResendResetTime || now > user.otpResendResetTime.getTime() + 60 * 60 * 1000) {
            user.otpResendCount = 0;
            user.otpResendResetTime = now;
        }

        if (user.otpResendCount >= 5) {
            return res.status(429).json({ message: 'Maximum resend attempts reached. Please try again after an hour.' });
        }

        const otp = generateOTP();
        user.otpHash = await bcrypt.hash(otp, 10);
        user.otpExpiry = now + 10 * 60 * 1000;
        user.otpAttempts = 0; // reset attempts for new OTP
        user.lastOtpSentAt = now;
        user.otpResendCount += 1;
        await user.save();

        const emailSent = await sendVerificationOTP(user.email, user.name, otp);
        if (!emailSent.success) {
            return res.status(500).json({ message: 'Failed to send OTP email' });
        }

        if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
            console.log(`\n==========================================`);
            console.log(`🔑 DEV RESEND OTP: ${otp} for ${email}`);
            console.log(`==========================================\n`);
        }

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Resend OTP Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email before logging in.', email: user.email });
        }

        if (await user.comparePassword(password)) {
            user.lastLogin = Date.now();
            await user.save({ validateBeforeSave: false });

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
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

        const emailSent = await sendResetLink({ toEmail: email, userName: user.name, resetUrl });
        if (emailSent.success) {
            res.json({ message: 'Password reset link sent to your email.' });
        } else {
            if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
                console.log(`\n==========================================`);
                console.log(`⚠️  EMAIL SEND FAILED: ${emailSent.error}`);
                console.log(`🔑 DEV FALLBACK RESET LINK: ${resetUrl}`);
                console.log(`==========================================\n`);
                return res.json({ 
                    message: 'Reset link generated successfully (Dev Mode Fallback)',
                    resetUrl,
                    devFallback: true 
                });
            }
            res.status(500).json({ message: 'Failed to send email' });
        }
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token) return res.status(400).json({ message: 'Reset token is required.' });

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
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: error.message });
    }
};
