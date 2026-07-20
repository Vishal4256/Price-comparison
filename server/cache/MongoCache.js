const Product = require('../models/Product');
const logger = require('../utils/logger');

class MongoCache {
  /**
   * Search cache for products matching normalized query.
   * In a real Mongo implementation, we'd use text indexes.
   * @param {string} query 
   * @returns {Array|null} Array of matched products or null if cache miss/expired.
   */
  async get(query) {
    try {
      // Find products that match the query and were updated recently (e.g., last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const cachedProducts = await Product.find({
        $text: { $search: query },
        updatedAt: { $gt: oneDayAgo }
      }).limit(20);

      // Cache hit threshold: If we found enough relevant items, return them.
      if (cachedProducts.length > 0) {
        return cachedProducts.map(p => p.toObject());
      }
      return null;
    } catch (err) {
      logger.error('MongoCache get error:', err);
      return null;
    }
  }

  /**
   * Upsert scraped and matched product groups into MongoDB.
   * @param {Array} matchedGroups 
   */
  async set(matchedGroups) {
    if (!matchedGroups || matchedGroups.length === 0) return;

    try {
      const operations = matchedGroups.map(group => {
        return {
          updateOne: {
            filter: { sku: group.offers[0].sku }, // Basic matching filter for upsert
            update: {
              $set: {
                name: group.title,
                brand: group.brand,
                category: group.category || 'unknown',
                imageUrl: group.offers[0].imageUrl,
                basePrice: group.lowestPrice,
                updatedAt: new Date()
              }
            },
            upsert: true
          }
        };
      });

      await Product.bulkWrite(operations);
    } catch (err) {
      logger.error('MongoCache set error:', err);
    }
  }
}

module.exports = new MongoCache();
