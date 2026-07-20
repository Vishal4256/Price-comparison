const logger = require('../utils/logger');
const HealthMonitor = require('../monitoring/HealthMonitor');

class RetailerRegistry {
  constructor() {
    this.scrapers = new Map();
  }

  /**
   * Register a scraper implementation for a retailer.
   * @param {string} retailerId 
   * @param {Object} scraperInstance 
   */
  register(retailerId, scraperInstance) {
    if (this.scrapers.has(retailerId)) {
      logger.warn(`Overwriting existing scraper for retailer: ${retailerId}`);
    }

    // Decorate the search method to automatically report to HealthMonitor
    const originalSearch = scraperInstance.search.bind(scraperInstance);
    scraperInstance.search = async (query, options) => {
      const startTime = Date.now();
      try {
        const results = await originalSearch(query, options);
        HealthMonitor.recordSuccess(retailerId, Date.now() - startTime);
        return results;
      } catch (err) {
        HealthMonitor.recordFailure(retailerId, err.message);
        throw err;
      }
    };

    this.scrapers.set(retailerId, scraperInstance);
    logger.info(`Registered scraper for ${retailerId} with Health Monitoring.`);
  }

  /**
   * Get a scraper by its retailer ID.
   * @param {string} retailerId 
   * @returns {Object|null}
   */
  getScraper(retailerId) {
    return this.scrapers.get(retailerId) || null;
  }

  /**
   * Get all registered scrapers.
   * @returns {Array} Array of scraper instances
   */
  getAllScrapers() {
    return Array.from(this.scrapers.values());
  }

  /**
   * Filter and return scrapers relevant for a specific query context.
   * In v1.1.0, this returns all scrapers by default, but can be expanded
   * based on category/intent filtering.
   * @param {Object} intent - Extracted intent from the query
   * @returns {Array} Array of relevant scraper instances
   */
  getRelevantScrapers(intent, context = {}) {
    let scrapers = this.getAllScrapers().filter(scraper => HealthMonitor.isAvailable(scraper.retailerId));
    
    if (context.region) {
      const RegionRegistry = require('../services/retailers/RegionRegistry');
      const validRetailers = RegionRegistry.getRetailersForRegion(context.region);
      if (validRetailers.length > 0) {
        // Here we map our mock retailer strings ('Amazon India') to scraper IDs ('amazon')
        // In a real app, RegionRegistry would use actual scraper IDs
        const allowedIds = validRetailers.map(r => {
          if (r.toLowerCase().includes('amazon')) return 'amazon';
          if (r.toLowerCase().includes('flipkart')) return 'flipkart';
          return r.toLowerCase();
        });
        
        scrapers = scrapers.filter(s => allowedIds.includes(s.retailerId));
      }
    }
    
    return scrapers;
  }
}

// Export as singleton
const registry = new RetailerRegistry();
module.exports = registry;
