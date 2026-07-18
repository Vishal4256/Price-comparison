const express = require('express');
const rateLimit = require('express-rate-limit');
const validate = require('../middleware/validate');
const authValidation = require('../validation/auth.validation');
const { register, login, forgotPassword, resetPassword, refresh, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Rate limiters
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 create account requests per windowMs
    message: { message: 'Too many accounts created from this IP, please try again after 15 minutes' }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

const passwordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Too many password reset requests from this IP.' }
});

router.post('/register', registerLimiter, validate(authValidation.register), register);
router.post('/login', loginLimiter, validate(authValidation.login), login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.post('/forgot-password', passwordLimiter, forgotPassword);
router.put('/reset-password/:token', passwordLimiter, resetPassword);

module.exports = router;
