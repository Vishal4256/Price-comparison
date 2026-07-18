const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

// Protected API routes
router.get('/:id/history', protect, historyController.getHistory);
router.get('/:id/statistics', protect, historyController.getStatistics);

// Internal usage (can be protected differently later)
router.post('/record', historyController.recordPrice);

module.exports = router;
