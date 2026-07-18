const express = require('express');
const router = express.Router();
const { universalSearch } = require('../controllers/searchController');
const rateLimit = require('express-rate-limit');
const validate = require('../middleware/validate');
const searchValidation = require('../validation/search.validation');
const { protect } = require('../middleware/auth');
const cache = require('../middleware/cache');

// Rate limiter to prevent abuse of the Gemini API and Scrapers
const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 searches per minute per IP
    message: { success: false, message: 'Too many searches. Please try again in a minute.' }
});

router.get('/universal', searchLimiter, validate(searchValidation.search), cache(3600), universalSearch);

module.exports = router;
