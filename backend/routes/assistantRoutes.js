const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/assistantController');
const rateLimit = require('express-rate-limit');

const assistantLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 20, 
    message: { success: false, message: 'Too many messages. Please slow down.' }
});

router.post('/chat', assistantLimiter, chat);

module.exports = router;
