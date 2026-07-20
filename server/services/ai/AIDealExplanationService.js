const { z } = require('zod');
const GeminiProvider = require('./GeminiProvider');
const dealPrompt = require('../../prompts/dealPrompt');
const logger = require('../../utils/logger');

const dealSchema = z.object({
  explanation: z.string()
});

class AIDealExplanationService {
  /**
   * Generates a natural language explanation of a deal based on pricing metrics.
   * @param {Object} metrics Pricing metrics (e.g., currentPrice, average30Day, etc.)
   * @returns {string} The explanation text
   */
  async explainDeal(metrics) {
    if (!metrics || !metrics.currentPrice) return "Not enough pricing data to explain this deal.";

    try {
      const input = JSON.stringify({
        currentPrice: metrics.currentPrice,
        lowestPrice: metrics.lowestPrice,
        highestPrice: metrics.highestPrice,
        average30Day: metrics.avg30Day,
        dealScore: metrics.dealScore,
        availability: metrics.isAvailable ? "In Stock" : "Out of Stock"
      }, null, 2);

      const response = await GeminiProvider.generateStructured(
        dealPrompt,
        input,
        dealSchema,
        'deal_explanation'
      );

      return response.explanation;
    } catch (error) {
      logger.warn(`AIDealExplanationService failed: ${error.message}`);
      return "This deal was scored automatically based on current market rates.";
    }
  }
}

module.exports = new AIDealExplanationService();
