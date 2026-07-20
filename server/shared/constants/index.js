module.exports = {
  ROLES: {
    ADMIN: 'ADMIN',
    USER: 'USER',
    PARTNER: 'PARTNER'
  },
  CATEGORIES: {
    ELECTRONICS: 'Electronics',
    FASHION: 'Fashion',
    HOME: 'Home',
    BEAUTY: 'Beauty',
    SPORTS: 'Sports'
  },
  CACHE_TTL: {
    DEFAULT: 3600, // 1 hour
    PRODUCTS: 86400, // 24 hours
  },
  SCRAPER_TIMEOUT: 15000, // 15 seconds
  ERROR_CODES: {
    NOT_FOUND: 'NOT_FOUND',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    BAD_REQUEST: 'BAD_REQUEST'
  }
};
