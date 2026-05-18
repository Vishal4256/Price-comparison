const express = require('express');
const router = express.Router();
const { getPriceHistory } = require('../controllers/priceController');
const { protect } = require('../middleware/auth');

router.get('/:productId', protect, getPriceHistory);

module.exports = router;
