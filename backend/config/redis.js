const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;

if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL, {
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        maxRetriesPerRequest: 3
    });

    redisClient.on('connect', () => {
        logger.info('Connected to Redis');
    });

    redisClient.on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
            logger.warn('Redis is unavailable. Application will run in degraded mode (bypassing cache).');
        } else {
            logger.error('Redis Error:', err.message);
        }
    });
} else {
    logger.warn('No REDIS_URL provided. Application will run in degraded mode (bypassing cache).');
}

module.exports = redisClient;
