const selectors = require('./selectors');
const logger = require('../../utils/logger');

class FlipkartParser {
  async parseSearchResults(page, limit = 10) {
    const results = [];
    try {
      const items = page.locator(selectors.search.resultItem);
      const count = await items.count();

      for (let i = 0; i < Math.min(count, limit); i++) {
        const item = items.nth(i);
        
        const titleLocator = item.locator(selectors.search.title);
        const priceLocator = item.locator(selectors.search.priceWhole);
        const linkLocator = item.locator(selectors.search.link);
        const imageLocator = item.locator(selectors.search.image);

        if (await titleLocator.count() > 0 && await priceLocator.count() > 0) {
          const title = await titleLocator.first().textContent();
          const priceText = await priceLocator.first().textContent();
          const urlPath = await linkLocator.first().getAttribute('href');
          let imageUrl = null;
          if (await imageLocator.count() > 0) {
            imageUrl = await imageLocator.first().getAttribute('src');
          }

          results.push({
            title: title ? title.trim() : null,
            brand: null,
            price: priceText ? parseFloat(priceText.replace(/₹|,/g, '')) : null,
            currency: 'INR',
            availability: 'In Stock',
            image: imageUrl,
            productUrl: urlPath ? (urlPath.startsWith('http') ? urlPath : `https://www.flipkart.com${urlPath}`) : null,
            sku: null
          });
        }
      }
    } catch (err) {
      logger.error(`[FlipkartParser] Failed to parse search results: ${err.message}`);
      throw new Error(`Parsing Error: ${err.message}`);
    }
    return results;
  }
}

module.exports = new FlipkartParser();
