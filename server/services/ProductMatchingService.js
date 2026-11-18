const crypto = require('crypto');
const ProductIdentityEngine = require('./intelligence/ProductIdentityEngine');
const PriceIntelligenceEngine = require('./intelligence/PriceIntelligenceEngine');
const DealScoreService = require('./intelligence/DealScoreService');
const logger = require('../utils/logger');

class ProductMatchingService {
  /**
   * Group an array of normalized products into matched sets.
   * @param {Array} normalizedProducts 
   * @returns {Array} Array of matched product groups.
   */
  match(normalizedProducts) {
    if (!normalizedProducts || normalizedProducts.length === 0) return [];

    // 1. Process all products through the Product Identity Engine
    const identifiedProducts = normalizedProducts.map(p => ({
      ...p,
      identity: ProductIdentityEngine.process(p.title)
    })).filter(p => p.identity !== null);

    const grouped = new Map();

    // 2. Group products using the Similarity Engine
    for (const product of identifiedProducts) {
      let matchedGroupId = null;
      let highestSimilarity = 0;

      // Check against existing groups for a fuzzy match
      for (const [groupId, group] of grouped.entries()) {
        const similarity = ProductIdentityEngine.computeSimilarity(product.identity, group.baseIdentity);
        // Threshold for match: > 75%
        if (similarity > 0.75 && similarity > highestSimilarity) {
          highestSimilarity = similarity;
          matchedGroupId = groupId;
        }
      }

      // Create new group if no match found
      if (!matchedGroupId) {
        matchedGroupId = product.identity.canonicalId || crypto.randomUUID();
        grouped.set(matchedGroupId, {
          groupId: matchedGroupId,
          baseIdentity: product.identity,
          title: product.title,
          offers: []
        });
      }

      // Add offer to the matched group
      const group = grouped.get(matchedGroupId);
      group.offers.push({
        retailerId: product.retailerId,
        price: product.price,
        url: product.url,
        imageUrl: product.imageUrl,
        sku: product.sku,
        isAvailable: product.availability !== false
      });
      
      // Update group title to the shortest (cleanest) title if it belongs to a valid offer
      if (product.title.length < group.title.length) {
        group.title = product.title;
      }
    }

    // 3. Apply Price Intelligence and Deal Scoring to each canonical group
    return Array.from(grouped.values()).map(group => {
      // Calculate real-time price metrics
      const priceSummary = PriceIntelligenceEngine.summarize(group.offers);
      
      // Calculate a live deal score (without historical context for now)
      const dealScore = DealScoreService.score(priceSummary, null);

      return {
        id: group.groupId, // Standardized ID for the frontend/DB
        title: group.title,
        brand: group.baseIdentity.brand,
        model: group.baseIdentity.model,
        specs: {
          storage: group.baseIdentity.storage,
          ram: group.baseIdentity.ram,
          color: group.baseIdentity.color
        },
        offers: group.offers,
        priceIntelligence: priceSummary,
        dealScore: dealScore,
        confidenceScore: this.calculateConfidence(group.offers)
      };
    });
  }

  calculateConfidence(offers) {
    if (offers.length === 1) return 0.6;
    if (offers.length === 2) return 0.8;
    return 0.95;
  }
}

module.exports = new ProductMatchingService();
