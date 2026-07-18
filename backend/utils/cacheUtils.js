const redisClient = require('../config/redis');
const logger = require('./logger');

exports.invalidateUserCache = async (userId, path) => {
    if (!redisClient || redisClient.status !== 'ready') return;

    try {
        const key = `cache:user:${userId}:${path}`;
        await redisClient.del(key);
        logger.debug(`Invalidated cache for key: ${key}`);
    } catch (err) {
        logger.error(`Failed to invalidate cache: ${err.message}`);
    }
};

exports.invalidateUserFeed = (userId) => {
    return exports.invalidateUserCache(userId, '/api/feed');
};
