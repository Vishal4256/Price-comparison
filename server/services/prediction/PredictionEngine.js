const Prediction = require('../../models/Prediction');
const TrackedProduct = require('../../models/TrackedProduct');
const logger = require('../../utils/logger');

class PredictionEngine {
  /**
   * Generates or fetches a cached prediction for a product.
   * Uses Hybrid Strategy: Product History -> Category Trend -> Insufficient Data
   */
  async getPrediction(canonicalProductId, category = 'General') {
    try {
      // 1. Check cache (predictions expire after 24 hours)
      const cached = await Prediction.findOne({ productId: canonicalProductId });
      if (cached) {
        return this._formatPrediction(cached);
      }

      // 2. Fetch history (mock logic for now since we don't have a dense PriceHistory collection yet)
      // In reality, we'd query a PriceHistory collection for the last 30 days.
      const history = await this._fetchProductHistory(canonicalProductId);
      
      let newPrediction;
      if (history.days >= 7 && history.samples >= 5) {
        // Product-level prediction
        newPrediction = this._calculateProductPrediction(canonicalProductId, history);
      } else {
        // Fallback to Category Trend
        const categoryTrend = await this._getCategoryTrend(category);
        if (categoryTrend) {
          newPrediction = this._calculateCategoryPrediction(canonicalProductId, categoryTrend, history);
        } else {
          // Insufficient Data
          newPrediction = {
            productId: canonicalProductId,
            prediction: 'Insufficient Product History',
            fallbackUsed: 'Insufficient Data',
            expectedPrice: history.currentPrice || null,
            confidence: 0.1,
            basedOn: {
              historyDays: history.days,
              samples: history.samples,
              volatility: 'Unknown',
              categoryTrend: false
            }
          };
        }
      }

      // 3. Save to cache
      const savedPrediction = await Prediction.create(newPrediction);
      return this._formatPrediction(savedPrediction);

    } catch (err) {
      logger.error(`[PredictionEngine] Error predicting for ${canonicalProductId}: ${err.message}`);
      return null;
    }
  }

  _formatPrediction(predictionDoc) {
    return {
      prediction: predictionDoc.prediction,
      fallback: predictionDoc.fallbackUsed !== 'None' ? predictionDoc.fallbackUsed : undefined,
      expectedPrice: predictionDoc.expectedPrice,
      confidence: predictionDoc.confidence,
      timeWindow: predictionDoc.timeWindow,
      basedOn: predictionDoc.basedOn
    };
  }

  // --- STUBS FOR STATISTICAL CALCULATION ---
  async _fetchProductHistory(productId) {
    // Stub: Returns mock history density. 
    // In production, aggregate PriceHistory for the last 30 days.
    const product = await TrackedProduct.findOne({ canonicalProductId: productId });
    return {
      days: product ? 10 : 2,
      samples: product ? 8 : 1,
      currentPrice: product ? product.targetPrice : null, // Proxy for current
      trend: 'Stable'
    };
  }

  async _getCategoryTrend(category) {
    // Stub: Returns category level pricing trend (e.g. phones are dropping 2% this month)
    if (category === 'Electronics' || category === 'Smartphones') {
      return { trend: 'Likely to decrease', expectedChangePct: -2 };
    }
    return null;
  }

  _calculateProductPrediction(productId, history) {
    // Statistical placeholder
    return {
      productId,
      prediction: history.trend === 'Stable' ? 'Stable' : 'Likely to decrease',
      fallbackUsed: 'None',
      expectedPrice: history.currentPrice ? Math.floor(history.currentPrice * 0.98) : null,
      confidence: 0.85,
      basedOn: {
        historyDays: history.days,
        samples: history.samples,
        volatility: 'Low',
        categoryTrend: false
      }
    };
  }

  _calculateCategoryPrediction(productId, categoryTrend, history) {
    return {
      productId,
      prediction: 'Insufficient Product History',
      fallbackUsed: 'Category Trend',
      expectedPrice: history.currentPrice ? Math.floor(history.currentPrice * (1 + (categoryTrend.expectedChangePct/100))) : null,
      confidence: 0.58,
      basedOn: {
        historyDays: history.days,
        samples: history.samples,
        volatility: 'Unknown',
        categoryTrend: true
      }
    };
  }
}

module.exports = new PredictionEngine();
