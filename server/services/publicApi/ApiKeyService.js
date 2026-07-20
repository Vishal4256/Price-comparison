const crypto = require('crypto');
const ApiKey = require('../../models/ApiKey');
const logger = require('../../utils/logger');

class ApiKeyService {
  /**
   * Generates a new API key for a partner.
   * @param {string} partnerId - The User ID of the partner
   * @param {string} name - Friendly name for the key
   * @param {string} tier - API Tier (FREE, STARTER, BUSINESS, ENTERPRISE)
   * @returns {Object} { rawKey, apiKeyDoc }
   */
  async generateKey(partnerId, name, tier = 'FREE') {
    // Generate a secure random string (e.g. ps_live_1234567890abcdef)
    const rawKey = 'ps_live_' + crypto.randomBytes(32).toString('hex');
    
    // Hash the key for storage (SHA-256)
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKeyDoc = await ApiKey.create({
      partnerId,
      name,
      keyHash,
      tier
    });

    logger.info(`Generated new API Key for partner ${partnerId} (${tier})`);

    // We only return the rawKey once. It cannot be retrieved again.
    return { rawKey, apiKeyDoc };
  }

  /**
   * Validates an incoming API key
   * @param {string} rawKey 
   * @returns {Object|null} The ApiKey document if valid, else null
   */
  async validateKey(rawKey) {
    if (!rawKey || !rawKey.startsWith('ps_live_')) {
      return null;
    }

    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    
    const apiKeyDoc = await ApiKey.findOne({ keyHash, status: 'ACTIVE' }).populate('partnerId');
    if (!apiKeyDoc) {
      return null;
    }

    // Fire and forget updating the last used timestamp
    ApiKey.updateOne({ _id: apiKeyDoc._id }, { lastUsedAt: new Date() }).exec();

    return apiKeyDoc;
  }

  /**
   * Revokes an API Key
   * @param {string} keyId - The document ID of the API Key
   * @param {string} partnerId - Must match for authorization
   */
  async revokeKey(keyId, partnerId) {
    const key = await ApiKey.findOneAndUpdate(
      { _id: keyId, partnerId },
      { status: 'REVOKED' }
    );
    if (key) {
      logger.info(`Revoked API Key ${keyId} for partner ${partnerId}`);
    }
    return key;
  }
}

module.exports = new ApiKeyService();
