const redisClient = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Express middleware to cache responses in Redis, with graceful fallback.
 * @param {number} ttl - Time to live in seconds
 */
const cache = (ttl) => {
    return async (req, res, next) => {
        // Bypass if Redis is not ready or disabled
        if (!redisClient || redisClient.status !== 'ready') {
            return next();
        }

        const userPrefix = req.user ? `user:${req.user._id}:` : '';
        const key = `cache:${userPrefix}${req.originalUrl || req.url}`;

        try {
            const cachedData = await redisClient.get(key);
            if (cachedData) {
                logger.debug(`Cache hit for ${key}`);
                return res.status(200).json(JSON.parse(cachedData));
            }

            // Wrap res.json to intercept and cache the response
            const originalJson = res.json;
            res.json = function (body) {
                // Only cache successful responses
                if (res.statusCode >= 200 && res.statusCode < 300 && body.success !== false) {
                    redisClient.setex(key, ttl, JSON.stringify(body)).catch(err => {
                        logger.error(`Redis setex error on ${key}: ${err.message}`);
                    });
                }
                // Call original res.json
                return originalJson.call(this, body);
            };

            next();
        } catch (error) {
            logger.error(`Cache middleware error on ${key}: ${error.message}`);
            // Graceful degradation: ignore error and proceed
            next();
        }
    };
};

module.exports = cache;
