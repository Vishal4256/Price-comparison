const predictionEngine = require('./PredictionEngine');
const logger = require('../../utils/logger');

class BuyDecisionService {
  /**
   * Evaluates pricing state to recommend a purchase action.
   * Outcomes: BUY NOW, GOOD DEAL, WATCH, WAIT, INSUFFICIENT DATA
   */
  async evaluate(productGroup, intent) {
    try {
      const currentPrice = productGroup.lowestPrice;
      if (!currentPrice) return { recommendation: 'INSUFFICIENT DATA', reason: 'No current price available.' };

      // 1. Get Prediction
      const prediction = await predictionEngine.getPrediction(productGroup.id, intent?.category);

      // 2. Base Heuristics
      const isLowest30d = productGroup.priceIntelligence?.isLowestIn30Days || false;
      const average30d = productGroup.priceIntelligence?.average30Days || currentPrice;
      const discountPct = ((average30d - currentPrice) / average30d) * 100;

      // 3. Decision Matrix
      if (prediction.confidence < 0.3) {
        return {
          recommendation: 'INSUFFICIENT DATA',
          reason: 'Not enough historical data to make a confident recommendation.',
          prediction
        };
      }

      if (prediction.prediction === 'Likely to decrease') {
        if (discountPct > 15) {
          return {
            recommendation: 'GOOD DEAL',
            reason: `Price is ${discountPct.toFixed(1)}% below average, but trend suggests it might drop further. Buying now is safe, but waiting could yield slightly more savings.`,
            prediction
          };
        }
        return {
          recommendation: 'WAIT',
          reason: `Price is predicted to decrease to around ₹${prediction.expectedPrice} in the next ${prediction.timeWindow}. Hold off on buying.`,
          prediction
        };
      }

      if (prediction.prediction === 'Likely to increase') {
        return {
          recommendation: 'BUY NOW',
          reason: `Prices are trending upwards. Current price (₹${currentPrice}) is likely the lowest you'll see in the next ${prediction.timeWindow}.`,
          prediction
        };
      }

      // Stable / Insufficient Product History falling back to Category
      if (isLowest30d) {
        return {
          recommendation: 'BUY NOW',
          reason: 'This is the lowest price in 30 days and the trend is stable. Excellent time to buy.',
          prediction
        };
      }

      if (discountPct > 5) {
        return {
          recommendation: 'GOOD DEAL',
          reason: `Price is ${discountPct.toFixed(1)}% below the 30-day average.`,
          prediction
        };
      }

      return {
        recommendation: 'WATCH',
        reason: 'Prices are stable and average. Consider setting a price alert for a price drop.',
        prediction
      };

    } catch (err) {
      logger.error(`[BuyDecisionService] Evaluation failed: ${err.message}`);
      return { recommendation: 'INSUFFICIENT DATA', reason: 'Internal error during evaluation.' };
    }
  }
}

module.exports = new BuyDecisionService();
