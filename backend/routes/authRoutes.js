const express = require('express');
const { register, login, forgotPassword, resetPassword, verifyEmail, resendVerificationEmail } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.post('/verify-email', verifyEmail);
router.post('/resend-verification-email', protect, resendVerificationEmail);

module.exports = router;
