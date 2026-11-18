const { errorResponse } = require('../utils/response');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const requestId = req.id;
  errorResponse(res, err, requestId);
};

module.exports = errorHandler;
