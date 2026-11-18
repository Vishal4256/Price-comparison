class ShippingService {
  /**
   * Estimates shipping cost for a product in a given region
   * @param {number} basePrice 
   * @param {Object} regionContext 
   * @returns {number} Shipping cost in local currency
   */
  estimateShipping(basePrice, regionContext) {
    // Mock logic: Free shipping over a certain amount
    const thresholds = {
      'IN': { min: 500, cost: 50 },
      'US': { min: 25, cost: 5 },
      'DE': { min: 30, cost: 4 },
      'GB': { min: 20, cost: 3 }
    };

    const rules = thresholds[regionContext.country] || { min: 0, cost: 0 };
    
    if (basePrice >= rules.min) {
      return 0; // Free shipping
    }
    return rules.cost;
  }
}

module.exports = new ShippingService();
