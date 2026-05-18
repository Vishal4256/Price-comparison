const express = require('express');
const PriceHistory = require('../models/PriceHistory');
const router = express.Router();

router.get('/:productId', async (req, res) => {
    try {
        const history = await PriceHistory.find({ productId: req.params.productId }).sort({ timestamp: 1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
