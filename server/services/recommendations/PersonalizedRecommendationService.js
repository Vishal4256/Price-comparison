const TrackedProduct = require('../../models/TrackedProduct');
const SearchHistory = require('../../models/SearchHistory');
const logger = require('../../utils/logger');

class PersonalizedRecommendationService {
  /**
   * Generates a personalized feed for a user based on deterministic activity scoring.
   */
  async getPersonalizedFeed(userId, limit = 5) {
    try {
      if (!userId) return [];

      // 1. Gather User Activity (Stubbed query logic for v2.0)
      // Wishlist/Alerts
      const activeAlerts = await TrackedProduct.find({ userId, status: 'ACTIVE' });
      
      // Recent Searches
      const recentSearches = await SearchHistory.find({ userId })
        .sort({ timestamp: -1 })
        .limit(10);
      
      // 2. Score candidate categories and brands
      const scoreMap = new Map();
      
      activeAlerts.forEach(alert => {
        // High weight for explicit alerts
        const key = `brand:${alert.brand || 'unknown'}`;
        scoreMap.set(key, (scoreMap.get(key) || 0) + 5);
      });

      recentSearches.forEach(search => {
        // Medium weight for searches
        if (search.intent) {
          const key = `category:${search.intent}`;
          scoreMap.set(key, (scoreMap.get(key) || 0) + 2);
        }
      });

      // 3. Fetch Recommendations based on top scores
      // In production, query the canonical product catalog sorted by these weights.
      // For Phase 2.0, we will return a stubbed structured array demonstrating the output.
      
      const topScoringKeys = Array.from(scoreMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

      const recommendations = topScoringKeys.map(entry => {
        const [type, value] = entry[0].split(':');
        return {
          recommendationType: 'Personalized',
          basedOn: type === 'brand' ? `Because you are tracking ${value} products` : `Based on your recent search for ${value}`,
          score: entry[1],
          productStub: {
            title: `Recommended ${value} product`,
            brand: type === 'brand' ? value : 'Various',
            category: type === 'category' ? value : 'Various',
            lowestPrice: 49999
          }
        };
      });

      return recommendations;

    } catch (err) {
      logger.error(`[PersonalizedRecommendationService] Error generating feed for ${userId}: ${err.message}`);
      return [];
    }
  }
}

module.exports = new PersonalizedRecommendationService();
