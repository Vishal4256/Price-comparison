const selectors = require('./selectors');
const logger = require('../../utils/logger');

class FlipkartParser {
  async parseSearchResults(page, limit = 10) {
    const results = [];
    try {
      const items = page.locator(selectors.search.resultItem);
      const count = await items.count();
      console.log(`[FlipkartParser] Found ${count} items with selector ${selectors.search.resultItem}`);
      if (count > 0) {
        const html = await items.first().evaluate(el => el.innerHTML);
        require('fs').writeFileSync('flipkart_item.html', html);
      }

      for (let i = 0; i < Math.min(count, limit); i++) {
        const item = items.nth(i);
        
        const titleLocator = item.locator(selectors.search.title);
        const priceLocator = item.locator(selectors.search.priceWhole);
        const linkLocator = item.locator(selectors.search.link);
        const imageLocator = item.locator(selectors.search.image);

        const titleCount = await titleLocator.count();
        const priceCount = await priceLocator.count();
        console.log(`[FlipkartParser] Item ${i}: titleCount=${titleCount}, priceCount=${priceCount}`);

        if (titleCount > 0 && priceCount > 0) {
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
