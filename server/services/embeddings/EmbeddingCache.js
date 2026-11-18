const ProductEmbedding = require('../../models/ProductEmbedding');
const geminiEmbeddingProvider = require('./GeminiEmbeddingProvider');
const logger = require('../../utils/logger');

class EmbeddingCache {
  /**
   * Generates a composite string describing the product for the LLM to embed.
   */
  _buildEmbeddingText(product) {
    // We want semantic matching, so combining brand, title, and key features is vital
    return `Brand: ${product.brand || 'Unknown'}, Product: ${product.title || product.name || ''}, Category: ${product.category || 'General'}`;
  }

  /**
   * Retrieve embedding for a canonical product, fetching and caching if necessary.
   */
  async getEmbeddingForProduct(product) {
    const canonicalId = product.id || product.canonicalId || product._id.toString();
    const modelVersion = geminiEmbeddingProvider.getModelVersion();

    try {
      // 1. Check Cache
      const cached = await ProductEmbedding.findOne({ canonicalId, modelVersion });
      if (cached) {
        return cached.vector;
      }

      // 2. Cache Miss -> Generate
      const textToEmbed = this._buildEmbeddingText(product);
      const vector = await geminiEmbeddingProvider.generateEmbedding(textToEmbed);

      // 3. Save to Cache
      await ProductEmbedding.findOneAndUpdate(
        { canonicalId },
        {
          canonicalId,
          title: product.title || product.name,
          brand: product.brand,
          category: product.category,
          vector,
          modelVersion,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );

      return vector;
    } catch (err) {
      logger.error(`[EmbeddingCache] Error fetching embedding for ${canonicalId}: ${err.message}`);
      return null;
    }
  }

  /**
   * Computes Cosine Similarity between two vectors.
   */
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

module.exports = new EmbeddingCache();
