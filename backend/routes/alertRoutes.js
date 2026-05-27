const express = require('express');
const { createAlert, getUserAlerts, deleteAlert, subscribeNewsletter } = require('../controllers/alertController');
const { protect } = require('../utils/authMiddleware');
const router = express.Router();

// Public newsletter/global alert subscription
router.post('/subscribe', subscribeNewsletter);

// Protected routes
router.use(protect);
router.post('/', createAlert);
router.get('/', getUserAlerts);
router.delete('/:id', deleteAlert);

module.exports = router;
