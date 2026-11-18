const logger = require('./logger');

const successResponse = (res, data, requestId, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    requestId,
    data
  });
};

const createdResponse = (res, data, requestId) => {
  return successResponse(res, data, requestId, 201);
};

const errorResponse = (res, error, requestId) => {
  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Internal Server Error';
  const errorCode = error.errorCode || 'INTERNAL_ERROR';

  if (!error.isOperational) {
    logger.error(`[${requestId}] Unexpected Error: `, error);
  } else {
    logger.warn(`[${requestId}] Operational Error: ${message}`);
  }

  return res.status(statusCode).json({
    success: false,
    requestId,
    errorCode,
    message
  });
};

module.exports = {
  successResponse,
  createdResponse,
  errorResponse
};
