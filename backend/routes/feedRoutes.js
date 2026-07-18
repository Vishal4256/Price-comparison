const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const { protect } = require('../middleware/auth');
const cache = require('../middleware/cache');

// Get personalized home feed (cached for 5 minutes per user)
router.get('/', protect, cache(300), feedController.getFeed);

module.exports = router;
