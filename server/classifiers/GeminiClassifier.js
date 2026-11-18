const { z } = require('zod');
const IntentClassifier = require('./IntentClassifier');
const RuleBasedClassifier = require('./RuleBasedClassifier');
const GeminiProvider = require('../services/ai/GeminiProvider');
const intentPrompt = require('../prompts/intentPrompt');
const logger = require('../utils/logger');

// Define the exact schema we expect Gemini to return
const intentSchema = z.object({
  intent: z.enum(['product_search', 'category_search', 'deal_search', 'unknown']),
  category: z.string().nullable().default(null),
  brand: z.string().nullable().default(null),
  model: z.string().nullable().default(null),
  filters: z.record(z.any()).default({}),
  confidence: z.number().min(0).max(1)
});

class GeminiClassifier extends IntentClassifier {
  async classify(query, context = {}) {
    const fallbackIntent = await RuleBasedClassifier.classify(query);
    
    // Add regional context to the prompt
    let contextualQuery = `User Query: "${query}"`;
    if (context.region) {
      contextualQuery += `\n(Context: User is searching from ${context.region.countryName || context.region.country}, Currency: ${context.region.currency})`;
    }

    try {
      logger.info(`Classifying intent via Gemini for: "${query}" (Region: ${context.region?.country || 'Default'})`);
      
      const aiResponse = await GeminiProvider.generateStructured(
        intentPrompt, 
        contextualQuery, 
        intentSchema,
        'intent_classification'
      );

      // Merge the AI result with the structured DTO we expect in the pipeline
      return {
        originalQuery: query,
        normalizedQuery: query.toLowerCase().trim(),
        category: aiResponse.category || fallbackIntent.category,
        brand: aiResponse.brand || fallbackIntent.brand,
        model: aiResponse.model || null,
        filters: aiResponse.filters || {},
        suggestedRetailers: fallbackIntent.suggestedRetailers, // Keep heuristic routing for now
        confidence: aiResponse.confidence,
        isAI: true
      };
      
    } catch (error) {
      logger.warn(`GeminiClassifier failed, falling back to RuleBasedClassifier: ${error.message}`);
      return { ...fallbackIntent, isAI: false, confidence: 0.5 };
    }
  }
}

module.exports = new GeminiClassifier();
