const express = require('express');
const router = express.Router();
const { comparePrice } = require('../controllers/priceController');
const { protect } = require('../middleware/auth');

router.get('/compare/:productId', protect, comparePrice);

module.exports = router;
