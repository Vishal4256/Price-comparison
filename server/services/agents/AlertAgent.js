const CreateAlertTool = require('../tools/CreateAlertTool');

class AlertAgent {
  async execute(context) {
    // Attempt to extract target product and price from context or query
    const productId = context.activeProducts && context.activeProducts.length > 0 
      ? context.activeProducts[0] 
      : null;
      
    // Mock extraction of target price
    const targetPrice = 50000; 

    if (!productId) {
      return {
        content: "I need to know which product you want to set an alert for first. Could you search for a product?",
        structuredData: {},
        contextUpdates: {}
      };
    }

    const result = await CreateAlertTool.execute({ productId, targetPrice }, context);

    if (result.success) {
      return {
        content: `Done! I've created a price alert. I'll notify you when the price drops below ${targetPrice}.`,
        structuredData: { alert: result.data },
        contextUpdates: {}
      };
    } else {
      return {
        content: `I couldn't set the alert: ${result.error}`,
        structuredData: {},
        contextUpdates: {}
      };
    }
  }
}

module.exports = new AlertAgent();
