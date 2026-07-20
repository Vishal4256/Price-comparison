class AffiliateProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Transforms an organic URL into an affiliate tracking URL
   * @param {string} originalUrl
   * @param {string} affiliateId
   * @param {string} campaign
   * @returns {string} The formatted tracking URL
   */
  generateTrackingUrl(originalUrl, affiliateId, campaign) {
    throw new Error('Not implemented');
  }

  /**
   * Optional: Validate if a URL belongs to this merchant
   * @param {string} url 
   * @returns {boolean}
   */
  matches(url) {
    return false;
  }
}

module.exports = AffiliateProvider;
