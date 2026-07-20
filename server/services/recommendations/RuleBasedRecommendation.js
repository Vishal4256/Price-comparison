const RecommendationProvider = require('./RecommendationProvider');

class RuleBasedRecommendation extends RecommendationProvider {
  async getRecommendations(intent, context = {}) {
    const recommendations = [];

    if (!intent || !intent.category) {
      return [{ type: 'category', value: 'electronics', reason: 'Popular Category' }];
    }

    if (intent.category === 'electronics') {
      recommendations.push({ type: 'category', value: 'accessories', reason: 'Frequently bought together' });
      if (intent.brand && intent.brand.toLowerCase() === 'apple') {
        recommendations.push({ type: 'product', value: 'Apple Watch', reason: 'Ecosystem pairing' });
      } else {
        recommendations.push({ type: 'product', value: 'Wireless Earbuds', reason: 'Top companion product' });
      }
    } else if (intent.category === 'fashion') {
      recommendations.push({ type: 'category', value: 'footwear', reason: 'Complete your look' });
    }

    return recommendations;
  }
}

module.exports = new RuleBasedRecommendation();
