/**
 * Abstract interface for Recommendation Providers
 */
class RecommendationProvider {
  constructor() {
    if (this.constructor === RecommendationProvider) {
      throw new Error("Abstract classes can't be instantiated.");
    }
  }

  /**
   * Generates recommendations based on intent and context.
   * @param {Object} intent The parsed search intent
   * @param {Object} context Additional context (e.g., userId)
   * @returns {Promise<Array>} List of recommended items or categories
   */
  async getRecommendations(intent, context = {}) {
    throw new Error("Method 'getRecommendations()' must be implemented.");
  }
}

module.exports = RecommendationProvider;
