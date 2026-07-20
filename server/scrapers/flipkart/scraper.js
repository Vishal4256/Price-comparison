const browserPool = require('../browser/BrowserPool');
const { RetryPolicy } = require('../antibot/RetryPolicy');
const antiBotManager = require('../antibot/AntiBotManager');
const parser = require('./parser');
const logger = require('../../utils/logger');

class FlipkartScraper {
  constructor() {
    this.retailerId = 'flipkart';
    this.baseUrl = 'https://www.flipkart.com';
    this.timeout = parseInt(process.env.SCRAPER_NAVIGATION_TIMEOUT_MS) || 30000;
  }

  async search(query, options = {}) {
    logger.info(`[FlipkartScraper] Searching for "${query}"`);
    
    return await RetryPolicy.withRetry('Flipkart Search', this.retailerId, null, async () => {
      let page, contextMeta;
      try {
        const browserOpts = antiBotManager.getBrowserOptions();
        const poolData = await browserPool.acquireContext(browserOpts);
        page = poolData.page;
        contextMeta = poolData.contextMeta;

        const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(query)}`;
        
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: this.timeout });
        await antiBotManager.simulateHumanInteraction(page);

        // Check for CAPTCHA
        if (await page.locator('form[action*="/captcha"]').count() > 0) {
          throw new Error('CAPTCHA detected');
        }

        // Wait for search result cards
        await page.waitForSelector('div[data-id]', { timeout: 10000 });
        
        const results = await parser.parseSearchResults(page, options.limit || 10);
        return results;

      } finally {
        if (page && contextMeta) {
          await browserPool.releasePage(page, contextMeta);
        }
      }
    });
  }
}

module.exports = new FlipkartScraper();
