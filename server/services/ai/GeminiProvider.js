const { GoogleGenAI } = require('@google/genai');
const AIProvider = require('./AIProvider');
const logger = require('../../utils/logger');
const AILog = require('../../models/AILog');

class GeminiProvider extends AIProvider {
  constructor() {
    super();
    // Initialize GoogleGenAI ONLY if API key is provided, allowing graceful degradation
    this.ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  async generateStructured(promptTemplate, input, schema, featureName = 'unknown') {
    if (!this.ai) {
      logger.warn('GeminiProvider skipped: GEMINI_API_KEY is missing');
      throw new Error('AI Provider not configured');
    }

    const startTime = Date.now();
    let success = false;
    let errorMsg = null;
    let usage = { prompt: 0, completion: 0, total: 0 };
    let parsedResult = null;

    try {
      const fullPrompt = `${promptTemplate}\n\nInput:\n${input}\n\nRespond ONLY with valid JSON.`;
      
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: fullPrompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2 // Low temp for deterministic structured output
        }
      });

      let text = response.text || '';
      
      // Cleanup markdown block wrapping just in case
      if (text.startsWith('```json')) text = text.slice(7);
      if (text.startsWith('```')) text = text.slice(3);
      if (text.endsWith('```')) text = text.slice(0, -3);
      text = text.trim();

      const rawJson = JSON.parse(text);

      // Validate with Zod if schema provided
      if (schema) {
        parsedResult = schema.parse(rawJson);
      } else {
        parsedResult = rawJson;
      }

      success = true;
      
      // Track usage (genai SDK has usageMetadata)
      if (response.usageMetadata) {
        usage = {
          prompt: response.usageMetadata.promptTokenCount || 0,
          completion: response.usageMetadata.candidatesTokenCount || 0,
          total: response.usageMetadata.totalTokenCount || 0
        };
      }

      return parsedResult;
    } catch (error) {
      errorMsg = error.message;
      logger.error(`GeminiProvider Error (${featureName}):`, errorMsg);
      throw error;
    } finally {
      const latency = Date.now() - startTime;
      
      // Log telemetry non-blocking
      try {
        AILog.create({
          feature: featureName,
          model: this.modelName,
          tokens: usage,
          latency,
          success,
          error: errorMsg
        }).catch(err => logger.error('Failed to save AILog:', err.message));
      } catch (err) {}
    }
  }
}

module.exports = new GeminiProvider();
