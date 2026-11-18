const embeddingCache = require('../embeddings/EmbeddingCache');
const logger = require('../../utils/logger');

class SimilarityEngine {
  /**
   * Find alternatives for a given canonical product from a catalog.
   * Uses Hybrid Strategy: Deterministic Rules + Embedding Semantics
   */
  async findAlternatives(targetProduct, catalog, limit = 3) {
    try {
      if (!targetProduct || !catalog || catalog.length === 0) return [];

      let targetVector = null;
      try {
        targetVector = await embeddingCache.getEmbeddingForProduct(targetProduct);
      } catch (err) {
        logger.warn(`[SimilarityEngine] Could not get vector for target product: ${err.message}`);
      }

      const scoredAlternatives = await Promise.all(
        catalog
          .filter(p => p.id !== targetProduct.id) // exclude self
          .map(async (candidate) => {
            // 1. Rule-based scoring
            let ruleScore = 0;
            if (candidate.category === targetProduct.category) ruleScore += 0.4;
            if (candidate.brand === targetProduct.brand) ruleScore += 0.2;
            
            // Price Band matching (within 20%)
            if (targetProduct.lowestPrice && candidate.lowestPrice) {
              const diff = Math.abs(targetProduct.lowestPrice - candidate.lowestPrice) / targetProduct.lowestPrice;
              if (diff <= 0.2) ruleScore += 0.3;
            }

            // Specs matching (if available)
            if (targetProduct.specs && candidate.specs) {
              if (targetProduct.specs.ram === candidate.specs.ram) ruleScore += 0.05;
              if (targetProduct.specs.storage === candidate.specs.storage) ruleScore += 0.05;
            }

            // 2. Embedding-based Semantic scoring
            let semanticScore = 0;
            if (targetVector) {
              try {
                const candidateVector = await embeddingCache.getEmbeddingForProduct(candidate);
                if (candidateVector) {
                  semanticScore = embeddingCache.cosineSimilarity(targetVector, candidateVector);
                }
              } catch (err) {
                // Ignore embedding errors for individual candidates to not break the batch
              }
            }

            // 3. Combined Hybrid Score (Weighted)
            // If semantic vector exists, weight it 60% semantic, 40% rules. Else 100% rules.
            let finalScore = ruleScore;
            if (targetVector && semanticScore > 0) {
              finalScore = (ruleScore * 0.4) + (semanticScore * 0.6);
            }

            // 4. Generate 'Reason' string
            let reason = 'Similar features';
            if (candidate.lowestPrice < targetProduct.lowestPrice) reason = 'Lower price';
            else if (candidate.brand === targetProduct.brand) reason = 'Same brand alternative';
            
            return {
              product: candidate,
              score: finalScore,
              reason
            };
          })
      );

      // Sort by descending score and slice
      const topAlternatives = scoredAlternatives
        .filter(item => item.score > 0.3) // minimum threshold
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => ({
          ...item.product,
          similarityReason: item.reason
        }));

      return topAlternatives;

    } catch (err) {
      logger.error(`[SimilarityEngine] Failed to find alternatives: ${err.message}`);
      return [];
    }
  }
}

module.exports = new SimilarityEngine();
