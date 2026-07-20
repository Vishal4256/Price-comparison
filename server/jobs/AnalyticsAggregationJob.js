const SearchHistory = require('../models/SearchHistory');
const AILog = require('../models/AILog');
const AnalyticsSummary = require('../models/AnalyticsSummary');
const logger = require('../utils/logger');

class AnalyticsAggregationJob {
  async run() {
    logger.info('[AnalyticsAggregationJob] Starting daily metrics aggregation...');
    
    // We aggregate data for "yesterday"
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    try {
      // 1. Search Metrics
      const searchStats = await SearchHistory.aggregate([
        { $match: { timestamp: { $gte: yesterday, $lt: today } } },
        { 
          $group: { 
            _id: null, 
            totalSearches: { $sum: 1 },
            uniqueUsers: { $addToSet: "$userId" },
            hits: { $sum: { $cond: ["$cacheHit", 1, 0] } },
            avgLatency: { $avg: "$latencyMs" }
          }
        }
      ]);

      const sStats = searchStats[0] || { totalSearches: 0, uniqueUsers: [], hits: 0, avgLatency: 0 };
      const searchMetrics = {
        totalSearches: sStats.totalSearches,
        uniqueUsers: sStats.uniqueUsers.length,
        cacheHitRatio: sStats.totalSearches > 0 ? (sStats.hits / sStats.totalSearches) * 100 : 0,
        averageLatencyMs: sStats.avgLatency || 0
      };

      // 2. AI Metrics
      const aiStats = await AILog.aggregate([
        { $match: { timestamp: { $gte: yesterday, $lt: today } } },
        {
          $group: {
            _id: null,
            totalCalls: { $sum: 1 },
            totalTokens: { $sum: "$tokens.total" },
            avgLatency: { $avg: "$latency" },
            errors: { $sum: { $cond: ["$success", 0, 1] } }
          }
        }
      ]);

      const aStats = aiStats[0] || { totalCalls: 0, totalTokens: 0, avgLatency: 0, errors: 0 };
      const aiMetrics = {
        totalCalls: aStats.totalCalls,
        totalTokens: aStats.totalTokens,
        averageLatencyMs: aStats.avgLatency || 0,
        errorRate: aStats.totalCalls > 0 ? (aStats.errors / aStats.totalCalls) * 100 : 0
      };

      // Save to AnalyticsSummary
      await AnalyticsSummary.findOneAndUpdate(
        { date: yesterday },
        { date: yesterday, searchMetrics, aiMetrics },
        { upsert: true, new: true }
      );

      logger.info(`[AnalyticsAggregationJob] Completed aggregation for ${yesterday.toISOString().split('T')[0]}`);
      return { processedItems: 1, errors: 0 };
      
    } catch (err) {
      logger.error(`[AnalyticsAggregationJob] Failed: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new AnalyticsAggregationJob();
