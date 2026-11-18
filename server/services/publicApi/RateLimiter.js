// Simple in-memory rate limiter for public API
// In a real production system, this would be backed by Redis.

const rateLimits = {
  FREE: 100,      // per hour
  STARTER: 1000,
  BUSINESS: 10000,
  ENTERPRISE: 100000
};

const usageStore = new Map();

class RateLimiter {
  /**
   * Check if the API key has exceeded its quota
   * @param {string} apiKeyHash - The hash of the API key
   * @param {string} tier - The tier of the API key
   * @returns {boolean} True if allowed, False if rate limited
   */
  checkLimit(apiKeyHash, tier = 'FREE') {
    const limit = rateLimits[tier] || rateLimits.FREE;
    const now = Date.now();
    const currentWindowStart = now - (now % (60 * 60 * 1000)); // Start of current hour

    let usage = usageStore.get(apiKeyHash);

    if (!usage || usage.windowStart !== currentWindowStart) {
      usage = { windowStart: currentWindowStart, count: 0 };
    }

    if (usage.count >= limit) {
      return false; // Rate limited
    }

    usage.count += 1;
    usageStore.set(apiKeyHash, usage);
    return true;
  }
}

module.exports = new RateLimiter();
