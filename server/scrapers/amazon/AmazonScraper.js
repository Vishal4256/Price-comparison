const BrowserScraper = require('../BrowserScraper');

class AmazonScraper extends BrowserScraper {
  constructor() {
    super('amazon');
    this.baseUrl = 'https://www.amazon.in';
    this.healthCheckUrl = this.baseUrl;
  }

  async search(query, options = {}) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      const searchUrl = `${this.baseUrl}/s?k=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      // Wait for search results container
      await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 5000 }).catch(() => null);

      const rawResults = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('[data-component-type="s-search-result"]'));
        return items.map(item => {
          const titleElement = item.querySelector('h2 a span');
          const priceElement = item.querySelector('.a-price-whole');
          const linkElement = item.querySelector('h2 a');
          const imageElement = item.querySelector('.s-image');
          const ratingElement = item.querySelector('.a-icon-alt');

          return {
            title: titleElement ? titleElement.textContent.trim() : null,
            price: priceElement ? priceElement.textContent.trim() : null,
            url: linkElement ? linkElement.href : null,
            imageUrl: imageElement ? imageElement.src : null,
            rating: ratingElement ? ratingElement.textContent.trim() : null,
          };
        }).filter(item => item.title && item.price);
      });

      await page.close();
      return rawResults.slice(0, options.limit || 10);
      
    } catch (error) {
      if (page) await page.close();
      throw new Error(`Amazon search failed: ${error.message}`);
    }
  }

  async getProduct(productId) {
    // productId here would be the ASIN
    const url = `${this.baseUrl}/dp/${productId}`;
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      const rawProduct = await page.evaluate(() => {
        const title = document.querySelector('#productTitle')?.textContent.trim();
        const price = document.querySelector('.a-price-whole')?.textContent.trim();
        const imageUrl = document.querySelector('#landingImage')?.src;
        
        return { title, price, imageUrl, url: window.location.href };
      });

      await page.close();
      return rawProduct;
    } catch (error) {
      if (page) await page.close();
      throw new Error(`Amazon getProduct failed: ${error.message}`);
    }
  }
}

module.exports = new AmazonScraper();
