const ApiKeyService = require('../services/publicApi/ApiKeyService');
const RateLimiter = require('../services/publicApi/RateLimiter');
const logger = require('../utils/logger');

const publicApiAuth = async (req, res, next) => {
  const apiKeyHeader = req.header('x-api-key');

  if (!apiKeyHeader) {
    return res.status(401).json({ error: 'Missing x-api-key header' });
  }

  try {
    const apiKeyDoc = await ApiKeyService.validateKey(apiKeyHeader);

    if (!apiKeyDoc) {
      return res.status(401).json({ error: 'Invalid or revoked API key' });
    }

    // Check Rate Limit
    if (!RateLimiter.checkLimit(apiKeyDoc.keyHash, apiKeyDoc.tier)) {
      logger.warn(`API Rate limit exceeded for partner ${apiKeyDoc.partnerId}`);
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    // Attach partner info to request
    req.partner = apiKeyDoc.partnerId;
    req.apiKey = apiKeyDoc;
    
    next();
  } catch (err) {
    logger.error(`Public API Auth Error: ${err.message}`);
    res.status(500).json({ error: 'Server Error during authentication' });
  }
};

module.exports = publicApiAuth;
