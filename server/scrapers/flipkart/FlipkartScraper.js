const BrowserScraper = require('../BrowserScraper');

class FlipkartScraper extends BrowserScraper {
  constructor() {
    super('flipkart');
    this.baseUrl = 'https://www.flipkart.com';
    this.healthCheckUrl = this.baseUrl;
  }

  async search(query, options = {}) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    
    try {
      const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(query)}`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      // Wait for search results container. 
      // Flipkart classes are dynamically generated (e.g., _1AtVbE, _75nlfW, etc.), 
      // so this is a generalized placeholder logic for the skeleton.
      await page.waitForSelector('div[data-id]', { timeout: 5000 }).catch(() => null);

      const rawResults = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('div[data-id]'));
        return items.map(item => {
          // In a real implementation, you'd target the specific obfuscated classes
          const linkElement = item.querySelector('a[href*="/p/"]');
          const titleElement = item.querySelector('div[class*="title"]') || item.querySelector('.s1Q9rs') || linkElement;
          const priceElement = item.querySelector('div[class*="price"]') || item.querySelector('._30jeq3');
          const imageElement = item.querySelector('img');

          return {
            title: titleElement ? (titleElement.title || titleElement.textContent.trim()) : null,
            price: priceElement ? priceElement.textContent.trim() : null,
            url: linkElement ? linkElement.href : null,
            imageUrl: imageElement ? imageElement.src : null,
            sku: item.getAttribute('data-id')
          };
        }).filter(item => item.title && item.price);
      });

      await page.close();
      return rawResults.slice(0, options.limit || 10);
      
    } catch (error) {
      if (page) await page.close();
      throw new Error(`Flipkart search failed: ${error.message}`);
    }
  }

  async getProduct(productId) {
    const url = `${this.baseUrl}/p/${productId}`;
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      const rawProduct = await page.evaluate(() => {
        const title = document.querySelector('.B_NuCI')?.textContent.trim() || document.querySelector('h1')?.textContent.trim();
        const price = document.querySelector('._30jeq3')?.textContent.trim();
        const imageUrl = document.querySelector('.q6DClP')?.style.backgroundImage.slice(5, -2) || document.querySelector('img._396cs4')?.src;
        
        return { title, price, imageUrl, url: window.location.href };
      });

      await page.close();
      return rawProduct;
    } catch (error) {
      if (page) await page.close();
      throw new Error(`Flipkart getProduct failed: ${error.message}`);
    }
  }
}

module.exports = new FlipkartScraper();
