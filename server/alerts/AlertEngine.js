const notificationProvider = process.env.NOTIFICATION_PROVIDER === 'email' 
  ? require('../notifications/ConsoleNotificationProvider') // Fallback to console for now until EmailProvider is built
  : require('../notifications/ConsoleNotificationProvider');

const User = require('../models/User');
const logger = require('../utils/logger');

// Alert Rules
class TargetPriceRule {
  evaluate(trackedProduct, priceSummary) {
    if (trackedProduct.targetPrice && priceSummary.lowestPrice <= trackedProduct.targetPrice) {
      return {
        triggered: true,
        subject: `Price Drop Alert: Target reached!`,
        body: `The price has dropped to ₹${priceSummary.lowestPrice}, which is below your target of ₹${trackedProduct.targetPrice}. Available at: ${priceSummary.cheapestUrl}`
      };
    }
    return { triggered: false };
  }
}

class DealScoreRule {
  evaluate(trackedProduct, priceSummary) {
    if (trackedProduct.dealScoreThreshold && priceSummary.dealScore && priceSummary.dealScore.score >= trackedProduct.dealScoreThreshold) {
      return {
        triggered: true,
        subject: `High Deal Score Alert! (${priceSummary.dealScore.score}/100)`,
        body: `We found an excellent deal! Score: ${priceSummary.dealScore.score}. Explanation: ${priceSummary.dealScore.explanation || 'N/A'}. Link: ${priceSummary.cheapestUrl}`
      };
    }
    return { triggered: false };
  }
}

class BackInStockRule {
  evaluate(trackedProduct, priceSummary) {
    if (trackedProduct.notifyBackInStock && priceSummary.isAvailable) {
      // NOTE: We'd need to track previous state to only alert when it goes OUT -> IN stock.
      // For now, if the user requested back in stock, we just alert if it's available.
      return {
        triggered: true,
        subject: `Back In Stock Alert!`,
        body: `The product you are tracking is now back in stock! Buy it here: ${priceSummary.cheapestUrl}`
      };
    }
    return { triggered: false };
  }
}

class AlertEngine {
  constructor() {
    this.rules = [
      new TargetPriceRule(),
      new DealScoreRule(),
      new BackInStockRule()
    ];
  }

  async evaluate(trackedProduct, priceSummary) {
    try {
      const user = await User.findById(trackedProduct.userId);
      if (!user) return;

      for (const rule of this.rules) {
        const result = rule.evaluate(trackedProduct, priceSummary);
        if (result.triggered) {
          logger.info(`[AlertEngine] Triggered alert for User ${user.email} on Product ${trackedProduct.canonicalProductId}`);
          
          await notificationProvider.send(
            user,
            result.subject,
            result.body,
            trackedProduct
          );

          // Once triggered, we might want to pause the alert so it doesn't spam every 15 minutes
          trackedProduct.status = 'FULFILLED';
          await trackedProduct.save();
          break; // Stop evaluating rules for this product if one triggers
        }
      }
    } catch (err) {
      logger.error(`[AlertEngine] Evaluation failed: ${err.message}`);
    }
  }
}

module.exports = new AlertEngine();
