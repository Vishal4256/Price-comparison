const Notification = require('../models/Notification');
const aiDecisionEngine = require('./aiDecisionEngine');

class NotificationEngine {
    
    async createNotification(data) {
        // Prevent duplicate spam: Check if same type for same product was sent in the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const existing = await Notification.findOne({
            userId: data.userId,
            productId: data.productId,
            type: data.type,
            createdAt: { $gte: twentyFourHoursAgo }
        });

        if (existing && data.type !== 'TARGET_PRICE_REACHED') {
            console.log(`[NotificationEngine] Skipped duplicate ${data.type} for ${data.productId}`);
            return null;
        }

        // Enhance message with AI if possible
        const aiMessage = await aiDecisionEngine.summarizeNotification({
            type: data.type,
            title: data.title,
            currentPrice: data.metadata.currentPrice,
            previousPrice: data.metadata.previousPrice,
            retailer: data.retailer,
            triggerReason: data.metadata.triggerReason
        });

        if (aiMessage) {
            data.message = aiMessage;
        }

        const notification = new Notification(data);
        await notification.save();
        return notification;
    }

    async evaluatePriceChange(userId, productId, title, retailer, currentPrice, previousPrice, targetPrice) {
        if (!previousPrice || currentPrice >= previousPrice) return; // No drop

        const dropAmount = previousPrice - currentPrice;
        const dropPercentage = (dropAmount / previousPrice) * 100;

        // 1. Target Price Reached
        if (targetPrice && currentPrice <= targetPrice) {
            await this.createNotification({
                userId,
                type: 'TARGET_PRICE_REACHED',
                productId,
                retailer,
                title,
                message: `Target price reached! ${title} is now ₹${currentPrice.toLocaleString()}.`,
                metadata: { currentPrice, previousPrice, triggerReason: 'target_reached' }
            });
            return; // Don't send a generic price drop if we sent a target reached
        }

        // 2. Significant Price Drop (e.g., > 5%)
        if (dropPercentage >= 5) {
            await this.createNotification({
                userId,
                type: 'PRICE_DROP',
                productId,
                retailer,
                title,
                message: `Price dropped by ${dropPercentage.toFixed(1)}%! ${title} is now ₹${currentPrice.toLocaleString()}.`,
                metadata: { currentPrice, previousPrice, triggerReason: 'significant_drop' }
            });
        }
    }
}

module.exports = new NotificationEngine();
