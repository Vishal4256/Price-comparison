const Prediction = require('../../models/Prediction');
const TrackedProduct = require('../../models/TrackedProduct');
const logger = require('../../utils/logger');

class PredictionEvaluator {
  /**
   * Evaluates the accuracy of predictions made in the past.
   * Runs as a background job to grade predictions whose timeWindow has elapsed.
   */
  async run() {
    logger.info('[PredictionEvaluator] Starting evaluation of past predictions...');
    let evaluated = 0;
    
    try {
      // Find predictions that are old enough to be evaluated, but haven't been evaluated yet
      // For a 7-day prediction, we look at predictions made 7 days ago.
      // Since our model TTL is currently 24 hours, in a real system we'd need a PredictionHistory collection.
      // For v2.0, we will just stub the evaluation logic structure.
      
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - 7);

      const predictionsToEvaluate = await Prediction.find({
        createdAt: { $lte: thresholdDate },
        actualAccuracy: { $exists: false }
      }).limit(100);

      for (const pred of predictionsToEvaluate) {
        // Fetch the actual current price to see if the prediction was right
        const product = await TrackedProduct.findOne({ canonicalProductId: pred.productId });
        if (product && product.targetPrice) {
          
          let accuracy = 0;
          if (pred.prediction === 'Likely to decrease' && product.targetPrice < pred.expectedPrice) accuracy = 100;
          else if (pred.prediction === 'Likely to increase' && product.targetPrice > pred.expectedPrice) accuracy = 100;
          else if (pred.prediction === 'Stable' && Math.abs(product.targetPrice - pred.expectedPrice) < (pred.expectedPrice * 0.02)) accuracy = 100;
          else accuracy = 0; // Missed prediction

          pred.actualAccuracy = accuracy;
          await pred.save();
          evaluated++;
        }
      }

      logger.info(`[PredictionEvaluator] Evaluated ${evaluated} predictions.`);
      return { evaluated, errors: 0 };
    } catch (err) {
      logger.error(`[PredictionEvaluator] Evaluation failed: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new PredictionEvaluator();
