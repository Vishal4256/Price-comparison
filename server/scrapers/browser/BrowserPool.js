const { chromium } = require('playwright');
const logger = require('../../utils/logger');

// Centralized browser manager ensuring reuse, isolation, and auto-cleanup
class BrowserPool {
  constructor() {
    this.browser = null;
    this.contexts = [];
    
    // Limits
    this.MAX_CONTEXTS = parseInt(process.env.SCRAPER_CONCURRENCY) || 2;
    this.MAX_PAGES_PER_CONTEXT = 3;
    this.IDLE_TIMEOUT_MS = 60000; // 1 minute

    this.idleTimer = null;
    this.activeRequests = 0;
  }

  async initBrowser() {
    if (!this.browser) {
      logger.info('[BrowserPool] Launching new Playwright browser instance.');
      this.browser = await chromium.launch({
        headless: process.env.NODE_ENV === 'production' || process.env.HEADLESS !== 'false',
        args: [
          '--disable-blink-features=AutomationControlled', // Evade some basic bot detections
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async acquireContext(options = {}) {
    this.activeRequests++;
    this._clearIdleTimer();

    await this.initBrowser();

    // Find a context with room for more pages, or create a new one if under limit
    let contextMeta = this.contexts.find(c => c.pagesCount < this.MAX_PAGES_PER_CONTEXT);

    if (!contextMeta) {
      if (this.contexts.length >= this.MAX_CONTEXTS) {
        // Wait for a context to free up (in a real system we'd use a queue/semaphore here,
        // for now we throw an error to trigger retry)
        this.activeRequests--;
        throw new Error('BrowserPool: Max concurrency reached. Try again later.');
      }

      logger.info('[BrowserPool] Creating new isolated context.');
      const context = await this.browser.newContext({
        userAgent: options.userAgent,
        viewport: options.viewport || { width: 1366, height: 768 },
        javaScriptEnabled: true,
        bypassCSP: true
      });

      contextMeta = { context, pagesCount: 0 };
      this.contexts.push(contextMeta);
    }

    contextMeta.pagesCount++;
    const page = await contextMeta.context.newPage();

    return { context: contextMeta.context, page, contextMeta };
  }

  async releasePage(page, contextMeta) {
    try {
      if (!page.isClosed()) {
        await page.close();
      }
      contextMeta.pagesCount--;

      // Clean up empty contexts to free memory
      if (contextMeta.pagesCount === 0) {
        await contextMeta.context.close();
        this.contexts = this.contexts.filter(c => c !== contextMeta);
      }
    } catch (err) {
      logger.error(`[BrowserPool] Error releasing page: ${err.message}`);
    } finally {
      this.activeRequests--;
      if (this.activeRequests <= 0) {
        this.activeRequests = 0;
        this._startIdleTimer();
      }
    }
  }

  _startIdleTimer() {
    this._clearIdleTimer();
    this.idleTimer = setTimeout(() => {
      logger.info(`[BrowserPool] Browser idle for ${this.IDLE_TIMEOUT_MS}ms. Cleaning up.`);
      this.closeAll();
    }, this.IDLE_TIMEOUT_MS);
  }

  _clearIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  async closeAll() {
    this._clearIdleTimer();
    try {
      for (const meta of this.contexts) {
        await meta.context.close();
      }
      this.contexts = [];
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      logger.info('[BrowserPool] All browsers closed.');
    } catch (err) {
      logger.error(`[BrowserPool] Error closing browsers: ${err.message}`);
    }
  }
}

// Export as singleton
module.exports = new BrowserPool();
