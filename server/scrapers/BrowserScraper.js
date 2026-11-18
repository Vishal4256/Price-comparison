const { chromium } = require('playwright');
const BaseScraper = require('./BaseScraper');

/**
 * Base Scraper for retailers that require browser automation.
 */
class BrowserScraper extends BaseScraper {
  constructor(retailerId) {
    super(retailerId);
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async healthCheck() {
    const startTime = Date.now();
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      await page.goto(this.healthCheckUrl || 'https://example.com', { waitUntil: 'domcontentloaded' });
      await page.close();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        lastFailure: null,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastFailure: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

module.exports = BrowserScraper;
