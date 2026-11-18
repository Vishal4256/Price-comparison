const logger = require('../../utils/logger');

/**
 * Module D: Deal Scoring
 * Calculates a 0-100 score based on current prices vs historical averages.
 */
class DealScoreService {
  
  /**
   * Generates a Deal Score and Category
   * @param {Object} priceSummary Output from PriceIntelligenceEngine
   * @param {Object} historicalAnalysis Output from HistoricalPriceEngine
   * @returns {Object} Deal Score result
   */
  score(priceSummary, historicalAnalysis) {
    if (!priceSummary || !priceSummary.isAvailable || priceSummary.lowestPrice === 0) {
      return this.getEmptyScore();
    }

    const currentBestPrice = priceSummary.lowestPrice;
    let score = 50; // Baseline score
    
    // 1. Comparison against 30-day average
    if (historicalAnalysis && historicalAnalysis.avg30Day > 0) {
      const avg = historicalAnalysis.avg30Day;
      const ratio = currentBestPrice / avg;
      
      // If current price is 20% below average, add 30 points
      if (ratio <= 0.8) score += 30;
      else if (ratio <= 0.9) score += 20;
      else if (ratio <= 0.95) score += 10;
      else if (ratio >= 1.1) score -= 20; // 10% more expensive than average
      else if (ratio >= 1.05) score -= 10;
    }

    // 2. Comparison against all-time low
    if (historicalAnalysis && historicalAnalysis.lowestRecorded > 0) {
      if (currentBestPrice <= historicalAnalysis.lowestRecorded) {
        score += 20; // It's at or below the all-time low!
      }
    }

    // 3. Savings available right now across retailers
    if (priceSummary.savingsPercentage > 20) {
      score += 10;
    }

    // Normalize to 0-100
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      score,
      category: this.categorize(score),
      description: this.generateDescription(score, priceSummary, historicalAnalysis)
    };
  }

  categorize(score) {
    if (score >= 90) return 'Excellent Deal';
    if (score >= 70) return 'Good Deal';
    if (score >= 50) return 'Fair';
    return 'Wait';
  }
  
  generateDescription(score, priceSummary, historicalAnalysis) {
    if (score >= 90) return 'Historically low price. Buy now.';
    if (score >= 70) return 'Below average price. Good time to buy.';
    if (score >= 50) return 'Average market price.';
    return 'Currently expensive. Wait for a price drop.';
  }

  getEmptyScore() {
    return {
      score: 0,
      category: 'Unknown',
      description: 'Not enough data to score'
    };
  }
}

module.exports = new DealScoreService();
