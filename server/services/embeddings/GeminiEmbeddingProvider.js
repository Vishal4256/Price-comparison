const { GoogleGenAI } = require('@google/genai');
const EmbeddingProvider = require('./EmbeddingProvider');
const logger = require('../../utils/logger');

class GeminiEmbeddingProvider extends EmbeddingProvider {
  constructor() {
    super();
    this.modelName = 'text-embedding-004'; // Latest stable Gemini embedding model
    if (!process.env.GEMINI_API_KEY) {
      logger.warn('[GeminiEmbeddingProvider] GEMINI_API_KEY is missing.');
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async generateEmbedding(text) {
    try {
      const response = await this.ai.models.embedContent({
        model: this.modelName,
        contents: text,
      });
      return response.embeddings[0].values;
    } catch (error) {
      logger.error(`[GeminiEmbeddingProvider] Failed to generate embedding: ${error.message}`);
      throw error;
    }
  }

  async generateEmbeddings(texts) {
    try {
      // Gemini's embedContent can take an array of contents for batch embedding
      const response = await this.ai.models.embedContent({
        model: this.modelName,
        contents: texts,
      });
      return response.embeddings.map(e => e.values);
    } catch (error) {
      logger.error(`[GeminiEmbeddingProvider] Failed to generate batch embeddings: ${error.message}`);
      throw error;
    }
  }

  getModelVersion() {
    return this.modelName;
  }
}

module.exports = new GeminiEmbeddingProvider();
