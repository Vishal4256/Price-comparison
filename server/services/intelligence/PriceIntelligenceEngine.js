const logger = require('../../utils/logger');

/**
 * Module B: Price Intelligence Engine
 * Computes price metrics (lowest, highest, average, savings, spread) across retailers
 * without any knowledge of the scraper implementations.
 */
class PriceIntelligenceEngine {
  
  /**
   * Generates a comprehensive summary of all available prices for a product.
   * @param {Array} retailerPrices List of objects { retailerId, price, isAvailable, url }
   * @returns {Object} Price summary
   */
  summarize(retailerPrices) {
    if (!retailerPrices || retailerPrices.length === 0) {
      return this.getEmptySummary();
    }

    const availableOffers = retailerPrices.filter(rp => rp.isAvailable && rp.price > 0);
    
    if (availableOffers.length === 0) {
      return this.getEmptySummary();
    }

    const prices = availableOffers.map(rp => rp.price);
    
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    const averagePrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    
    // Spread between the highest and lowest
    const priceSpread = highestPrice - lowestPrice;
    
    // Savings percentage (how much you save buying lowest vs highest)
    const savingsPercentage = highestPrice > 0 ? Math.round((priceSpread / highestPrice) * 100) : 0;
    
    // Find the cheapest retailer offer
    const cheapestOffer = availableOffers.find(rp => rp.price === lowestPrice);

    return {
      lowestPrice,
      highestPrice,
      averagePrice,
      priceSpread,
      savingsPercentage,
      cheapestRetailerId: cheapestOffer ? cheapestOffer.retailerId : null,
      cheapestUrl: cheapestOffer ? cheapestOffer.url : null,
      totalOffers: availableOffers.length,
      isAvailable: true
    };
  }

  getEmptySummary() {
    return {
      lowestPrice: 0,
      highestPrice: 0,
      averagePrice: 0,
      priceSpread: 0,
      savingsPercentage: 0,
      cheapestRetailerId: null,
      cheapestUrl: null,
      totalOffers: 0,
      isAvailable: false
    };
  }
}

module.exports = new PriceIntelligenceEngine();
