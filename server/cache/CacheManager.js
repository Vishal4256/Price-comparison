const mongoCache = require('./MongoCache');

class CacheManager {
  constructor() {
    this.primaryCache = mongoCache;
  }

  /**
   * Try to get results from the cache hierarchy.
   * @param {string} query 
   * @returns {Array|null}
   */
  async get(query) {
    // In the future, this can check MemoryCache/Redis first, then fallback to Mongo.
    return await this.primaryCache.get(query);
  }

  /**
   * Set results in the cache hierarchy.
   * @param {string} query 
   * @param {Array} results 
   */
  async set(query, results) {
    // Write to Mongo (and eventually Memory/Redis)
    await this.primaryCache.set(results);
  }
}

module.exports = new CacheManager();
