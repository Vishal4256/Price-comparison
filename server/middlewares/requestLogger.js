const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  // Generate or propagate request ID
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-Id', req.id);

  const start = Date.now();
  const { method, originalUrl, ip } = req;

  // Log incoming request
  logger.info(`[${req.id}] Incoming request`, { method, originalUrl, ip });

  // Wait for request to finish to log response info
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const userId = req.user ? req.user.id : 'unauthenticated';

    logger.info(`[${req.id}] Request completed`, { 
      method, 
      originalUrl, 
      statusCode, 
      duration: `${duration}ms`,
      userId,
      ip
    });
  });

  next();
};

module.exports = requestLogger;
