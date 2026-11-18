const AffiliateProvider = require('./AffiliateProvider');

class AmazonAffiliate extends AffiliateProvider {
  constructor() {
    super('amazon');
    this.tag = process.env.AMAZON_AFFILIATE_TAG || 'pricesmart-21';
  }

  matches(url) {
    return url.includes('amazon.in') || url.includes('amazon.com');
  }

  generateTrackingUrl(originalUrl, affiliateId = this.tag, campaign = '') {
    try {
      const urlObj = new URL(originalUrl);
      urlObj.searchParams.set('tag', affiliateId);
      if (campaign) {
        urlObj.searchParams.set('ascsubtag', campaign);
      }
      return urlObj.toString();
    } catch (e) {
      // Fallback if URL parsing fails
      return originalUrl;
    }
  }
}

module.exports = new AmazonAffiliate();
