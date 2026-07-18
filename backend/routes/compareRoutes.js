const express = require('express');
const router = express.Router();
const { compareProducts } = require('../controllers/compareController');
const rateLimit = require('express-rate-limit');

const compareLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, 
    max: 10, 
    message: { success: false, message: 'Too many comparison requests. Please try again in 5 minutes.' }
});

router.post('/', compareLimiter, compareProducts);

module.exports = router;
