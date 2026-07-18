const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const redisClient = require('../config/redis'); // We will create this in task 54

router.get('/live', (req, res) => {
    res.status(200).json({ status: 'live' });
});

router.get('/ready', async (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check Redis (graceful degradation)
    let redisStatus = 'degraded';
    if (redisClient && redisClient.status === 'ready') {
        redisStatus = 'connected';
    }

    const isHealthy = mongoStatus === 'connected';

    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'healthy' : 'unhealthy',
        mongodb: mongoStatus,
        redis: redisStatus
    });
});

// Alias for root
router.get('/', (req, res) => {
    res.redirect('/health/ready');
});

module.exports = router;
