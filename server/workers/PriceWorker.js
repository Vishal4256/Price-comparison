const TrackedProduct = require('../models/TrackedProduct');
const retailerRegistry = require('../scrapers/RetailerRegistry');
const AmazonNormalizer = require('../scrapers/amazon/AmazonNormalizer');
const FlipkartNormalizer = require('../scrapers/flipkart/FlipkartNormalizer');
const ProductIdentityEngine = require('../services/intelligence/ProductIdentityEngine');
const PriceIntelligenceEngine = require('../services/intelligence/PriceIntelligenceEngine');
const logger = require('../utils/logger');

// AlertEngine will be invoked when prices change
const AlertEngine = require('../alerts/AlertEngine'); 

class PriceWorker {
  /**
   * Processes all tracked products that are due for a refresh.
   */
  async processDueItems() {
    const now = new Date();
    
    // Find all active products where nextScheduledCheck is in the past
    const dueProducts = await TrackedProduct.find({
      status: 'ACTIVE',
      nextScheduledCheck: { $lte: now }
    }).limit(50); // Batch size to prevent memory overload

    if (dueProducts.length === 0) {
      return { processedItems: 0, errors: 0 };
    }

    let processedItems = 0;
    let errors = 0;

    logger.info(`[PriceWorker] Found ${dueProducts.length} due items to refresh.`);

    for (const item of dueProducts) {
      try {
        await this.refreshProduct(item);
        processedItems++;
      } catch (err) {
        logger.error(`[PriceWorker] Failed to refresh ${item.canonicalProductId}:`, err.message);
        errors++;
      }

      // Schedule the next check based on priority
      item.lastCheckedAt = new Date();
      item.nextScheduledCheck = this.calculateNextCheck(item.priority);
      await item.save();
    }

    return { processedItems, errors };
  }

  async refreshProduct(trackedProduct) {
    // 1. Convert canonical ID back into a search query string for the scrapers
    // For a real system, we'd look up the base product details from a CanonicalProduct DB.
    // Here we'll just replace dashes with spaces as a heuristic.
    const query = trackedProduct.canonicalProductId.replace(/-/g, ' ');
    
    // 2. Mocking an intent object for the registry
    const mockIntent = {
      normalizedQuery: query,
      suggestedRetailers: ['amazon', 'flipkart'] // Default to checking all
    };

    // 3. Get Healthy Scrapers
    const scrapers = retailerRegistry.getRelevantScrapers(mockIntent);

    // 4. Scrape
    const scrapePromises = scrapers.map(scraper => 
      scraper.search(query, { limit: 3 })
        .then(raw => ({ retailerId: scraper.retailerId, raw, status: 'fulfilled' }))
        .catch(err => ({ retailerId: scraper.retailerId, raw: [], status: 'rejected' }))
    );

    const results = await Promise.allSettled(scrapePromises);
    
    // 5. Normalize
    let offers = [];
    for (const res of results) {
      if (res.status === 'fulfilled' && res.value.status === 'fulfilled') {
        const { retailerId, raw } = res.value;
        let normalized = [];
        if (retailerId === 'amazon') normalized = raw.map(r => AmazonNormalizer.normalize(r));
        if (retailerId === 'flipkart') normalized = raw.map(r => FlipkartNormalizer.normalize(r));
        
        normalized.forEach(n => {
          if (n) {
            const identity = ProductIdentityEngine.process(n.title);
            if (identity && identity.canonicalId === trackedProduct.canonicalProductId) {
              offers.push({
                retailerId: n.retailerId,
                price: n.price,
                url: n.url,
                isAvailable: n.availability !== false
              });
            }
          }
        });
      }
    }

    // 6. Price Intelligence
    const priceSummary = PriceIntelligenceEngine.summarize(offers);

    // 7. Alert Engine Evaluation
    if (priceSummary && priceSummary.isAvailable) {
      await AlertEngine.evaluate(trackedProduct, priceSummary);
    }
  }

  calculateNextCheck(priority) {
    const next = new Date();
    switch (priority) {
      case 'HIGH':
        next.setMinutes(next.getMinutes() + 15); // 15 mins
        break;
      case 'MEDIUM':
        next.setHours(next.getHours() + 4); // 4 hours
        break;
      case 'LOW':
      default:
        next.setDate(next.getDate() + 1); // 24 hours
        break;
    }
    return next;
  }
}

module.exports = new PriceWorker();
