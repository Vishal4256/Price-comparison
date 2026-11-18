const axios = require('axios');
const cheerio = require('cheerio');
const BaseScraper = require('./BaseScraper');

/**
 * Base Scraper for retailers that can be scraped via lightweight HTTP requests.
 */
class HttpScraper extends BaseScraper {
  constructor(retailerId, baseURL) {
    super(retailerId);
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
  }

  /**
   * Helper to load HTML into cheerio.
   */
  async getHtml(url) {
    const response = await this.client.get(url);
    return cheerio.load(response.data);
  }

  async healthCheck() {
    const startTime = Date.now();
    try {
      await this.client.get('/');
      return {
        status: 'healthy',
        responseTime: Date.now() - startTime,
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

module.exports = HttpScraper;
