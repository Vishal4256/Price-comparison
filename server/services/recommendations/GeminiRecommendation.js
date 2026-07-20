const { z } = require('zod');
const RecommendationProvider = require('./RecommendationProvider');
const RuleBasedRecommendation = require('./RuleBasedRecommendation');
const GeminiProvider = require('../ai/GeminiProvider');
const recommendationPrompt = require('../../prompts/recommendationPrompt');
const logger = require('../../utils/logger');

const recommendationSchema = z.array(z.object({
  type: z.enum(['category', 'product']),
  value: z.string(),
  reason: z.string()
})).max(3).default([]);

class GeminiRecommendation extends RecommendationProvider {
  async getRecommendations(intent, context = {}) {
    const fallback = await RuleBasedRecommendation.getRecommendations(intent, context);

    if (!intent || !intent.category) {
      return fallback;
    }

    try {
      const input = JSON.stringify({
        searchIntent: intent,
        userContext: context
      }, null, 2);

      const recommendations = await GeminiProvider.generateStructured(
        recommendationPrompt,
        input,
        recommendationSchema,
        'recommendation'
      );

      return recommendations && recommendations.length > 0 ? recommendations : fallback;
    } catch (error) {
      logger.warn(`GeminiRecommendation failed: ${error.message}. Using fallback.`);
      return fallback;
    }
  }
}

module.exports = new GeminiRecommendation();
