const webpush = require('web-push');
const NotificationProvider = require('./NotificationProvider');
const logger = require('../../utils/logger');
require('dotenv').config();

class WebPushProvider extends NotificationProvider {
  constructor() {
    super();
    this.isConfigured = false;
    
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;

    if (publicKey && privateKey && subject) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.isConfigured = true;
      logger.info('WebPushProvider configured successfully with VAPID keys.');
    } else {
      logger.warn('WebPushProvider is NOT configured. Missing VAPID environment variables.');
    }
  }

  async send(subscription, payload) {
    if (!this.isConfigured) {
      logger.warn('Cannot send Web Push: VAPID keys not configured.');
      return false;
    }

    try {
      // Standardize the payload as requested
      const standardizedPayload = JSON.stringify({
        type: payload.type || 'INFO',
        title: payload.title || 'PriceSmart Notification',
        body: payload.body || '',
        actionUrl: payload.actionUrl || '/',
        productId: payload.productId || null
      });

      await webpush.sendNotification(subscription, standardizedPayload);
      logger.info(`Web Push sent successfully to subscription.`);
      return true;
    } catch (error) {
      logger.error(`Failed to send Web Push: ${error.message}`);
      if (error.statusCode === 410) {
        // 410 Gone means the subscription is no longer valid.
        logger.warn('Subscription is no longer valid (410 Gone). Should remove from DB.');
        // In a full implementation, you would trigger a DB deletion here.
      }
      return false;
    }
  }
}

module.exports = new WebPushProvider();
