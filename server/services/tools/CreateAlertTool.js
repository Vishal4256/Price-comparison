const AlertService = require('../alerts/AlertService');
const logger = require('../../utils/logger');

class CreateAlertTool {
  constructor() {
    this.name = 'createAlert';
    this.description = 'Creates a price drop alert for a user.';
    this.requiresConfirmation = false; // Low-risk action
  }

  async execute(args, context) {
    const { productId, targetPrice } = args;

    if (!context.userId) {
      return { success: false, error: 'User must be logged in to create an alert.' };
    }

    try {
      // Re-use existing service logic
      const alert = await AlertService.createAlert({
        userId: context.userId,
        productId,
        targetPrice,
        currency: context.region ? context.region.currency : 'INR'
      });
      
      return {
        success: true,
        data: alert
      };
    } catch (err) {
      logger.error(`CreateAlertTool failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new CreateAlertTool();
