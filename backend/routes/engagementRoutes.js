const express = require('express');
const router = express.Router();
const engagementController = require('../controllers/engagementController');
const { protect } = require('../middleware/auth');

// Notifications
router.get('/notifications', protect, engagementController.getNotifications);
router.put('/notifications/read-all', protect, engagementController.markAllAsRead);
router.put('/notifications/:id/read', protect, engagementController.markAsRead);
router.delete('/notifications/:id', protect, engagementController.deleteNotification);

// Deals (Coupons / Cashback)
router.get('/coupons/:productId', protect, engagementController.getCoupons);
router.get('/cashback/:productId', protect, engagementController.getCashback);

module.exports = router;
