const express = require('express');
const router = express.Router();
const visionController = require('../controllers/visionController');
const uploadMiddleware = require('../middleware/upload');
const rateLimit = require('express-rate-limit');

// Rate limiter specific to expensive vision API calls
const visionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per IP per window
    message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many vision searches from this IP.' } }
});

router.post('/search', visionLimiter, uploadMiddleware, visionController.searchByImage);
router.post('/barcode', visionLimiter, visionController.searchByBarcode);

module.exports = router;
