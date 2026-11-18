const { z } = require('zod');
const GeminiProvider = require('./GeminiProvider');
const summaryPrompt = require('../../prompts/summaryPrompt');
const AISummary = require('../../models/AISummary');
const logger = require('../../utils/logger');

const summarySchema = z.object({
  strengths: z.array(z.string()).max(3).default([]),
  drawbacks: z.array(z.string()).max(3).default([]),
  bestUseCases: z.array(z.string()).max(3).default([]),
  recommendation: z.string().default('')
});

class AIProductSummaryService {
  /**
   * Generates or retrieves an AI summary for a canonical product identity.
   * @param {Object} identity Canonical product identity (brand, model, etc.)
   * @returns {Object|null} Summary payload
   */
  async getSummary(identity) {
    if (!identity || !identity.canonicalId) return null;

    try {
      // 1. Check MongoDB Cache
      const cached = await AISummary.findOne({ canonicalProductId: identity.canonicalId });
      if (cached && new Date() < new Date(cached.expiresAt)) {
        return cached.summary;
      }

      // 2. Generate via Gemini if not cached or expired
      const promptInput = `Brand: ${identity.brand}\nModel: ${identity.model}\nStorage: ${identity.storage}\nRAM: ${identity.ram}`;
      
      const summary = await GeminiProvider.generateStructured(
        summaryPrompt, 
        promptInput, 
        summarySchema,
        'product_summary'
      );

      // 3. Persist to MongoDB (expires in 30 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await AISummary.findOneAndUpdate(
        { canonicalProductId: identity.canonicalId },
        { 
          canonicalProductId: identity.canonicalId,
          summary,
          model: GeminiProvider.modelName,
          expiresAt
        },
        { upsert: true, new: true }
      );

      return summary;

    } catch (error) {
      logger.error(`Failed to generate product summary for ${identity.canonicalId}:`, error.message);
      return null; // Graceful degradation: return null if AI fails
    }
  }
}

module.exports = new AIProductSummaryService();
