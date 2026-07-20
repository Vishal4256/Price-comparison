const express = require('express');
const router = express.Router();
const PriceWorker = require('../workers/PriceWorker');
const CacheRefreshJob = require('../jobs/CacheRefreshJob');
const AnalyticsAggregationJob = require('../jobs/AnalyticsAggregationJob');
const CronScheduler = require('../jobs/CronScheduler');
const logger = require('../utils/logger');

// Simple admin middleware - in production this would check JWT roles
const requireAdmin = (req, res, next) => {
  // Mock admin check
  const auth = req.headers['authorization'];
  if (auth && auth === 'Bearer admin-secret-token') {
    return next();
  }
  // Allow all for development, but log warning
  logger.warn('Unauthenticated admin access! Secure this route in production.');
  next();
};

router.use(requireAdmin);

// POST /api/admin/jobs/price-refresh
router.post('/jobs/price-refresh', async (req, res) => {
  try {
    CronScheduler.executeJob('PriceRefresh_Manual', async () => {
      return await PriceWorker.processDueItems();
    });
    res.json({ message: 'PriceRefresh job triggered manually.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/jobs/cache-refresh
router.post('/jobs/cache-refresh', async (req, res) => {
  try {
    CronScheduler.executeJob('CacheRefresh_Manual', async () => {
      return await CacheRefreshJob.run();
    });
    res.json({ message: 'CacheRefresh job triggered manually.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/jobs/analytics
router.post('/jobs/analytics', async (req, res) => {
  try {
    CronScheduler.executeJob('AnalyticsAggregation_Manual', async () => {
      return await AnalyticsAggregationJob.run();
    });
    res.json({ message: 'AnalyticsAggregation job triggered manually.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/intelligence/dashboard
const marketTrendService = require('../services/prediction/MarketTrendService');
router.get('/intelligence/dashboard', async (req, res) => {
  try {
    const trends = await marketTrendService.getLatestTrends();
    res.json({
      success: true,
      data: trends || {}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
