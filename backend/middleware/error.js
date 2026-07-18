const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userId: req.user ? req.user.id : 'unauthenticated'
    });

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'DUPLICATE_KEY_ERROR',
                message: 'Duplicate field value entered'
            }
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message
            }
        });
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: { code: 'INVALID_TOKEN', message: 'Token is invalid' }
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' }
        });
    }

    // Default 500 error response
    res.status(err.statusCode || 500).json({
        success: false,
        error: {
            code: err.code || 'SERVER_ERROR',
            message: err.message || 'Server Error'
        }
    });
};

module.exports = errorHandler;
