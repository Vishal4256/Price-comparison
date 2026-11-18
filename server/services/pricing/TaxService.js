class TaxService {
  constructor() {
    // Static lookup table for tax rates (VAT/GST) per country
    this.taxRates = {
      'IN': 0.18, // 18% GST average
      'US': 0.00, // Displayed pre-tax typically, varies by state
      'DE': 0.19, // 19% VAT
      'GB': 0.20  // 20% VAT
    };
  }

  /**
   * Calculates the tax amount for a given base price in a region
   * @param {number} basePrice 
   * @param {Object} regionContext 
   * @returns {number} Tax amount
   */
  calculateTax(basePrice, regionContext) {
    const rate = this.taxRates[regionContext.country] || 0;
    return basePrice * rate;
  }
}

module.exports = new TaxService();
