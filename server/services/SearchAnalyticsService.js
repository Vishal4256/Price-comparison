const logger = require('../utils/logger');
const SearchHistory = require('../models/SearchHistory');

class SearchAnalyticsService {
  /**
   * Log search analytics to database asynchronously.
   * @param {Object} data 
   */
  async recordSearch(data) {
    try {
      // In a high-throughput system, this would be pushed to a message queue (e.g. RabbitMQ/Kafka)
      // or batched before inserting. For v1.1.0, we'll insert directly but non-blocking.
      const record = new SearchHistory({
        query: data.query,
        userId: data.userId || null,
        resultsCount: data.resultsCount,
        metadata: {
          intent: data.intent,
          retailersUsed: data.retailersUsed,
          latencyMs: data.latencyMs,
          cacheHit: data.cacheHit,
          // Phase 2.2 Metrics
          scraperLatencyMs: data.scraperLatencyMs || null,
          rankingLatencyMs: data.rankingLatencyMs || null,
          averageMatchConfidence: data.averageMatchConfidence || null
        }
      });
      
      // Fire and forget (don't await in the critical path)
      record.save().catch(err => {
        logger.error('Failed to save search analytics:', err);
      });
      
    } catch (err) {
      logger.error('Search analytics error:', err);
    }
  }
}

module.exports = new SearchAnalyticsService();
