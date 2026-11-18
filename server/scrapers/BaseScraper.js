/**
 * Abstract Base Class for all Retailer Scrapers.
 * Ensures a consistent interface for the SearchPipelineService.
 */
class BaseScraper {
  constructor(retailerId) {
    if (this.constructor === BaseScraper) {
      throw new Error("Abstract classes can't be instantiated.");
    }
    this.retailerId = retailerId;
  }

  /**
   * Search for products on the retailer.
   * @param {string} query - The search query
   * @param {Object} options - Search options (e.g. limit, page)
   * @returns {Promise<Array>} - Array of raw product objects
   */
  async search(query, options = {}) {
    throw new Error("Method 'search()' must be implemented.");
  }

  /**
   * Fetch details for a specific product.
   * @param {string} productId - Retailer's unique product ID
   * @returns {Promise<Object>} - Raw product object
   */
  async getProduct(productId) {
    throw new Error("Method 'getProduct()' must be implemented.");
  }

  /**
   * Normalize the raw scraped data into our standard ProductDTO format.
   * Note: We are using a dedicated Normalizer class per the architecture,
   * but this can serve as a proxy to the normalizer to maintain interface simplicity.
   * @param {Object} rawData - Raw scraped data
   * @returns {Object} - Normalized ProductDTO-compatible object
   */
  normalize(rawData) {
    throw new Error("Method 'normalize()' must be implemented.");
  }

  /**
   * Perform a lightweight health check to ensure the scraper is operational.
   * @returns {Promise<Object>} - Health status metrics
   */
  async healthCheck() {
    throw new Error("Method 'healthCheck()' must be implemented.");
  }
}

module.exports = BaseScraper;
