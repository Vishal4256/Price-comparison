const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../middleware/auth');
const cache = require('../middleware/cache');

// User Dashboard
router.get('/user', protect, cache(300), dashboardController.getUserDashboard);

// Admin Dashboard & Health
router.get('/admin', protect, adminOnly, cache(300), dashboardController.getAdminDashboard);
router.get('/scrapers', protect, adminOnly, cache(60), dashboardController.getScraperDashboard);
router.get('/search', protect, dashboardController.getSearchAnalytics);

module.exports = router;
