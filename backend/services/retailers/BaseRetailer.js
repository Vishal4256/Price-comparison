/**
 * BaseRetailer defines the unified interface and metadata 
 * that every retailer scraper must implement.
 */
class BaseRetailer {
    constructor() {
        this.name = "Unknown";
        this.supportedCategories = [];
        this.supportsCoupons = false;
        this.supportsCashback = false;
    }

    /**
     * Search the retailer for a specific query.
     * @param {Object} queryParams - Object containing intent and keywords (e.g. { keywords: 'laptop', budget: 50000 })
     * @returns {Promise<Array>} Array of raw product objects.
     */
    async search(queryParams) {
        throw new Error(`[${this.name}] search() method not implemented.`);
    }

    /**
     * Get detailed information for a specific product URL.
     * @param {String} url 
     * @returns {Promise<Object>} Detailed product object.
     */
    async getProduct(url) {
        throw new Error(`[${this.name}] getProduct() method not implemented.`);
    }

    /**
     * Get available offers/variants for a product.
     * @param {Object} product 
     * @returns {Promise<Array>}
     */
    async getOffers(product) {
        throw new Error(`[${this.name}] getOffers() method not implemented.`);
    }

    /**
     * Get available coupons for a product.
     * @param {Object} product 
     * @returns {Promise<Array>}
     */
    async getCoupons(product) {
        if (!this.supportsCoupons) return [];
        throw new Error(`[${this.name}] getCoupons() method not implemented.`);
    }

    /**
     * Basic health check to ensure the retailer's DOM hasn't drastically changed.
     * @returns {Promise<Boolean>}
     */
    async healthCheck() {
        throw new Error(`[${this.name}] healthCheck() method not implemented.`);
    }
}

module.exports = BaseRetailer;
