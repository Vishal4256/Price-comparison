const selectors = require('./selectors');
const logger = require('../../utils/logger');

class AmazonParser {
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
          const imageUrl = await imageLocator.first().getAttribute('src');

          results.push({
            title: title ? title.trim() : null,
            brand: null, // extracted later by Identity Engine
            price: priceText ? parseFloat(priceText.replace(/,/g, '')) : null,
            currency: 'INR',
            availability: 'In Stock',
            image: imageUrl,
            productUrl: urlPath ? (urlPath.startsWith('http') ? urlPath : `https://www.amazon.in${urlPath}`) : null,
            sku: null
          });
        }
      }
    } catch (err) {
      logger.error(`[AmazonParser] Failed to parse search results: ${err.message}`);
      throw new Error(`Parsing Error: ${err.message}`); // Will be caught by RetryPolicy
    }
    return results;
  }
}

module.exports = new AmazonParser();
