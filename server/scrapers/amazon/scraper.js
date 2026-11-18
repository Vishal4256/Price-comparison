const browserPool = require('../browser/BrowserPool');
const { RetryPolicy } = require('../antibot/RetryPolicy');
const antiBotManager = require('../antibot/AntiBotManager');
const parser = require('./parser');
const logger = require('../../utils/logger');

class AmazonScraper {
  constructor() {
    this.retailerId = 'amazon';
    this.baseUrl = 'https://www.amazon.in';
    this.timeout = parseInt(process.env.SCRAPER_NAVIGATION_TIMEOUT_MS) || 30000;
  }

  async search(query, options = {}) {
    logger.info(`[AmazonScraper] Searching for "${query}"`);
    
    // We execute inside the retry policy
    return await RetryPolicy.withRetry('Amazon Search', this.retailerId, null, async () => {
      let page, contextMeta;
      try {
        const browserOpts = antiBotManager.getBrowserOptions();
        const poolData = await browserPool.acquireContext(browserOpts);
        page = poolData.page;
        contextMeta = poolData.contextMeta;

        const searchUrl = `${this.baseUrl}/s?k=${encodeURIComponent(query)}`;
        
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: this.timeout });
        await antiBotManager.simulateHumanInteraction(page);

        // Check for CAPTCHA to trigger fast fail
        if (await page.locator('form[action="/errors/validateCaptcha"]').count() > 0) {
          throw new Error('CAPTCHA detected'); // RetryPolicy will classify this as NonRetryable
        }

        await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 10000 });
        
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

module.exports = new AmazonScraper();
