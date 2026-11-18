const logger = require('../../utils/logger');

/**
 * Module C: Historical Price Engine
 * Analyzes time-series price data to compute trends and moving averages.
 */
class HistoricalPriceEngine {
  
  /**
   * Analyzes an array of historical price records
   * @param {Array} priceHistory Array of { price: Number, timestamp: Date }
   * @returns {Object} Historical metrics
   */
  analyze(priceHistory) {
    if (!priceHistory || priceHistory.length === 0) {
      return this.getEmptyAnalysis();
    }

    // Ensure sorted by newest first
    const sortedHistory = [...priceHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    const currentPrice = sortedHistory[0].price;
    const previousPrice = sortedHistory.length > 1 ? sortedHistory[1].price : currentPrice;
    
    const allPrices = sortedHistory.map(h => h.price);
    const lowestRecorded = Math.min(...allPrices);
    const highestRecorded = Math.max(...allPrices);

    // Percentage change from the last recorded price
    const percentageChange = previousPrice > 0 
      ? Math.round(((currentPrice - previousPrice) / previousPrice) * 100)
      : 0;

    const now = new Date();
    const msInDay = 24 * 60 * 60 * 1000;

    // 7-day average
    const last7Days = sortedHistory.filter(h => (now - new Date(h.timestamp)) <= 7 * msInDay);
    const avg7Day = this.computeAverage(last7Days);

    // 30-day average
    const last30Days = sortedHistory.filter(h => (now - new Date(h.timestamp)) <= 30 * msInDay);
    const avg30Day = this.computeAverage(last30Days);

    return {
      currentPrice,
      previousPrice,
      lowestRecorded,
      highestRecorded,
      percentageChange,
      avg7Day,
      avg30Day,
      isTrendingDown: percentageChange < 0
    };
  }

  computeAverage(records) {
    if (!records || records.length === 0) return 0;
    const sum = records.reduce((acc, curr) => acc + curr.price, 0);
    return Math.round(sum / records.length);
  }

  getEmptyAnalysis() {
    return {
      currentPrice: 0,
      previousPrice: 0,
      lowestRecorded: 0,
      highestRecorded: 0,
      percentageChange: 0,
      avg7Day: 0,
      avg30Day: 0,
      isTrendingDown: false
    };
  }
}

module.exports = new HistoricalPriceEngine();
