const NotificationProvider = require('./NotificationProvider');
const logger = require('../utils/logger');

class ConsoleNotificationProvider extends NotificationProvider {
  async send(user, subject, body, trackedProduct = null) {
    try {
      logger.info(`=================================================`);
      logger.info(`🔔 [NOTIFICATION TO: ${user.email}]`);
      logger.info(`Subject: ${subject}`);
      logger.info(`Body: ${body}`);
      logger.info(`=================================================`);

      await this.logDispatch(
        user._id,
        trackedProduct ? trackedProduct._id : null,
        'console',
        subject,
        body,
        'SENT'
      );
    } catch (err) {
      logger.error(`Failed to send console notification: ${err.message}`);
      await this.logDispatch(
        user._id,
        trackedProduct ? trackedProduct._id : null,
        'console',
        subject,
        body,
        'FAILED',
        err.message
      );
    }
  }
}

module.exports = new ConsoleNotificationProvider();
