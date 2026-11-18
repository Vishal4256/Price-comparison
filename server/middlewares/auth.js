const { verifyAccessToken } = require('../utils/jwt');
const { UnauthorizedError, ForbiddenError } = require('../errors/AppError');
const { ROLES } = require('../shared/constants');

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('No token provided. Authorization denied.'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new UnauthorizedError('Token is invalid or expired.'));
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = verifyAccessToken(token);
    } catch (error) {
      // It's optional, so we ignore invalid tokens here
    }
  }
  next();
};

const requireAdmin = (req, res, next) => {
  // Must be called AFTER requireAuth
  if (!req.user) {
    return next(new UnauthorizedError('No token provided. Authorization denied.'));
  }

  if (req.user.role !== ROLES.ADMIN) {
    return next(new ForbiddenError('Admin privileges required.'));
  }
  
  next();
};

const requirePartner = (req, res, next) => {
  // Must be called AFTER requireAuth
  if (!req.user) {
    return next(new UnauthorizedError('No token provided. Authorization denied.'));
  }

  if (req.user.role !== ROLES.PARTNER && req.user.role !== ROLES.ADMIN) {
    return next(new ForbiddenError('Partner privileges required.'));
  }
  
  next();
};

module.exports = {
  requireAuth,
  optionalAuth,
  requireAdmin,
  requirePartner
};
