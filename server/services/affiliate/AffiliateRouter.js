const amazonAffiliate = require('./AmazonAffiliate');
const flipkartAffiliate = require('./FlipkartAffiliate');

class AffiliateRouter {
  constructor() {
    this.providers = [amazonAffiliate, flipkartAffiliate];
  }

  /**
   * Route the URL to the correct affiliate provider
   * @param {string} url 
   * @param {string} campaign 
   * @returns {string} The tracking URL or the original URL if no provider matches
   */
  generateLink(url, campaign = '') {
    const provider = this.providers.find(p => p.matches(url));
    if (provider) {
      // Pass undefined for affiliateId to use the provider's default from env
      return provider.generateTrackingUrl(url, undefined, campaign);
    }
    return url;
  }
}

module.exports = new AffiliateRouter();
