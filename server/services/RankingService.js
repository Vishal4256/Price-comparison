class RankingService {
  /**
   * Rank matched product groups based on a combination of heuristics.
   * @param {Array} matchedGroups 
   * @param {Object} intent 
   * @returns {Array} Sorted matched groups
   */
  rank(matchedGroups, intent) {
    if (!matchedGroups || matchedGroups.length === 0) return [];

    return matchedGroups.sort((a, b) => {
      const scoreA = this.calculateScore(a, intent);
      const scoreB = this.calculateScore(b, intent);
      
      return scoreB - scoreA; // Descending order
    });
  }

  calculateScore(group, intent) {
    let score = 0;

    // 1. Availability Bonus
    const hasInStock = group.offers.some(o => o.availability === 'In Stock');
    if (hasInStock) score += 50;

    // 2. Confidence Bonus
    score += (group.confidenceScore || 0) * 20;

    // 3. Price Ranking (Lower is generally better if matching intent)
    // We give a slight penalty to extremely high prices to surface standard models first
    if (group.lowestPrice) {
      if (group.lowestPrice < 100000) score += 10;
      else if (group.lowestPrice > 200000) score -= 10;
    }

    // 4. Multi-Retailer Bonus (If a product is available on multiple platforms, it's likely more relevant)
    if (group.offers.length > 1) {
      score += group.offers.length * 5;
    }

    return score;
  }
}

module.exports = new RankingService();
