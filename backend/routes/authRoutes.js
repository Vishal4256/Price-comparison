const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login } = require('../controllers/authController');
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

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);

module.exports = router;
