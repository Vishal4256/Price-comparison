const express = require('express');
const mongoose = require('mongoose');
const https = require('https');
const router = express.Router();

// Lightweight Gemini probe — just checks if the API key returns any response (even a model list)
function checkGemini() {
    return new Promise((resolve) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return resolve({ status: 'not_configured' });

        const options = {
            hostname: 'generativelanguage.googleapis.com',
            port: 443,
            path: `/v1beta/models?key=${apiKey}`,
            method: 'GET',
        };

        const req = https.request(options, (res) => {
            if (res.statusCode === 200) return resolve({ status: 'available' });
            if (res.statusCode === 429) return resolve({ status: 'quota_exceeded' });
            if (res.statusCode === 400 || res.statusCode === 403) return resolve({ status: 'invalid_key' });
            return resolve({ status: `error_${res.statusCode}` });
        });
        req.on('error', () => resolve({ status: 'unreachable' }));
        req.setTimeout(5000, () => { req.destroy(); resolve({ status: 'timeout' }); });
        req.end();
    });
}

// GET /api/health — Full status report
router.get('/', async (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const geminiResult = await checkGemini();

    const isHealthy = mongoStatus === 'connected';

    res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        database: mongoStatus,
        gemini: geminiResult.status,
        redis: 'disabled',
        environment: process.env.NODE_ENV || 'development',
    });
});

// GET /health/live — Simple liveness probe (no external calls)
router.get('/live', (req, res) => {
    res.status(200).json({ status: 'live' });
});

// GET /health/ready — Readiness probe (MongoDB only)
router.get('/ready', (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const isReady = mongoStatus === 'connected';
    res.status(isReady ? 200 : 503).json({
        status: isReady ? 'ready' : 'not_ready',
        database: mongoStatus,
    });
});

module.exports = router;
