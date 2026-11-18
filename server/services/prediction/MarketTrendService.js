const MarketTrend = require('../../models/MarketTrend');
const logger = require('../../utils/logger');

class MarketTrendService {
  /**
   * Generates or fetches the market trend snapshot for a given date.
   */
  async getDailyTrend(date = new Date()) {
    try {
      // Normalize to midnight UTC for the given date
      const queryDate = new Date(date);
      queryDate.setHours(0, 0, 0, 0);

      // 1. Check cache/db for existing snapshot
      const existing = await MarketTrend.findOne({ date: queryDate });
      if (existing) {
        return existing;
      }

      // 2. Generate new snapshot (In a production system this would run as a cron job,
      // aggregating from SearchHistory, AILogs, and TrackedProducts.
      // For Phase 2.0, we generate a stub snapshot based on the new schema).

      logger.info(`[MarketTrendService] Generating new market trend snapshot for ${queryDate.toISOString()}`);
      
      const newSnapshot = {
        date: queryDate,
        topSearchedProducts: [], // Would aggregate from SearchHistory
        fastestRisingPrices: [], // Would aggregate from TrackedProduct
        biggestPriceDrops: [],
        trendingBrands: [],
        popularCategories: [],
        operationalMetrics: {
          averageAiLatencyMs: 0,
          predictionAccuracyPct: 0,
          averageRetailerDiscountPct: 0,
          mostVolatileProducts: []
        }
      };

      const saved = await MarketTrend.create(newSnapshot);
      return saved;

    } catch (err) {
      logger.error(`[MarketTrendService] Failed to get daily trend: ${err.message}`);
      return null;
    }
  }

  /**
   * Expose trends for API consumption
   */
  async getLatestTrends() {
    const today = new Date();
    return await this.getDailyTrend(today);
  }
}

module.exports = new MarketTrendService();
