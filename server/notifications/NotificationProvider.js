const NotificationLog = require('../models/NotificationLog');
const logger = require('../utils/logger');

/**
 * Abstract interface for Notification Providers.
 */
class NotificationProvider {
  constructor() {
    if (this.constructor === NotificationProvider) {
      throw new Error("Abstract classes can't be instantiated.");
    }
  }

  /**
   * Dispatch a notification to a user.
   * @param {Object} user Target user
   * @param {string} subject Notification subject/title
   * @param {string} body Notification body content
   * @param {Object} trackedProduct Reference to the product triggered
   */
  async send(user, subject, body, trackedProduct = null) {
    throw new Error("Method 'send()' must be implemented.");
  }

  /**
   * Helper to log the dispatch in the database.
   */
  async logDispatch(userId, trackedProductId, provider, subject, body, status, error = null) {
    try {
      await NotificationLog.create({
        userId,
        trackedProductId: trackedProductId ? trackedProductId : undefined,
        provider,
        subject,
        body,
        status,
        error,
        sentAt: status === 'SENT' ? new Date() : undefined
      });
    } catch (err) {
      logger.error(`Failed to log notification dispatch: ${err.message}`);
    }
  }
}

module.exports = NotificationProvider;
