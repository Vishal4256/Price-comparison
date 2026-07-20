const { GoogleGenAI } = require('@google/genai');
const logger = require('../../utils/logger');

class ExplainableAIService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      logger.warn('[ExplainableAIService] GEMINI_API_KEY is missing.');
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  /**
   * Generates a readable explanation grounded explicitly in the provided metrics.
   * @param {Object} evidence Structured metrics (e.g. currentPrice, average30Day, etc.)
   * @param {string} decision e.g., 'BUY NOW', 'WAIT'
   */
  async generateExplanation(evidence, decision) {
    try {
      const prompt = `
You are an expert shopping assistant for PriceSmart.
Your task is to explain a "${decision}" recommendation to the user.

CRITICAL RULE: You MUST base your explanation EXACTLY on the following evidence metrics. Do not invent, hallucinate, or add external facts. Keep it under 3 bullet points.

EVIDENCE:
- Current Price: ₹${evidence.currentPrice}
- 30-Day Average: ₹${evidence.average30Day}
- 30-Day Lowest: ₹${evidence.lowestPrice30Day}
- AI Price Prediction: ${evidence.prediction}
- Deal Score: ${evidence.dealScore}/100

Format as a concise, friendly explanation string.
      `;

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });

      return response.text;
    } catch (err) {
      logger.error(`[ExplainableAIService] Failed to generate explanation: ${err.message}`);
      // Graceful fallback to raw string formatting
      return `Recommendation to ${decision}. Current price is ₹${evidence.currentPrice} (Avg: ₹${evidence.average30Day}). Prediction: ${evidence.prediction}.`;
    }
  }
}

module.exports = new ExplainableAIService();
