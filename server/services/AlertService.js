const AlertRepository = require('../repositories/AlertRepository');

class AlertService {
  async createAlert({ userId, productId, targetPrice, currency }) {
    // Basic validation
    if (!userId || !productId || !targetPrice) {
      throw new Error('Missing required fields for alert creation');
    }

    // Use AlertRepository to create alert
    const newAlert = await AlertRepository.create({
      user: userId,
      product: productId,
      targetPrice: targetPrice,
      status: 'Active'
    });

    return newAlert;
  }
}

module.exports = new AlertService();
