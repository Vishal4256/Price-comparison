const AffiliateProvider = require('./AffiliateProvider');

class FlipkartAffiliate extends AffiliateProvider {
  constructor() {
    super('flipkart');
    this.affid = process.env.FLIPKART_AFFILIATE_ID || 'pricesmart';
  }

  matches(url) {
    return url.includes('flipkart.com');
  }

  generateTrackingUrl(originalUrl, affiliateId = this.affid, campaign = '') {
    try {
      const urlObj = new URL(originalUrl);
      urlObj.searchParams.set('affid', affiliateId);
      if (campaign) {
        urlObj.searchParams.set('affExtParam1', campaign);
      }
      return urlObj.toString();
    } catch (e) {
      return originalUrl;
    }
  }
}

module.exports = new FlipkartAffiliate();
