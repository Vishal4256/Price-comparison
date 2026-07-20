const SearchHistory = require('../models/SearchHistory');
const SearchPipelineService = require('../services/SearchPipelineService');
const logger = require('../utils/logger');

class CacheRefreshJob {
  async run() {
    logger.info('[CacheRefreshJob] Starting proactive cache refresh for popular searches...');
    let processedItems = 0;
    let errors = 0;

    try {
      // 1. Find top 10 most frequent searches in the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const popularSearches = await SearchHistory.aggregate([
        { $match: { timestamp: { $gte: yesterday } } },
        { $group: { _id: "$normalizedQuery", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      for (const item of popularSearches) {
        try {
          const query = item._id;
          logger.info(`[CacheRefreshJob] Proactively refreshing cache for: "${query}"`);
          
          // Execute the search pipeline with a special context flag 
          // to force cache bypass (we want fresh data) and prevent logging this as a user search
          await SearchPipelineService.execute(query, { isSystemRefresh: true, forceBypassCache: true });
          processedItems++;
        } catch (err) {
          logger.error(`[CacheRefreshJob] Failed to refresh "${item._id}": ${err.message}`);
          errors++;
        }
      }
    } catch (err) {
      logger.error(`[CacheRefreshJob] Aggregation failed: ${err.message}`);
      throw err;
    }

    return { processedItems, errors };
  }
}

module.exports = new CacheRefreshJob();
