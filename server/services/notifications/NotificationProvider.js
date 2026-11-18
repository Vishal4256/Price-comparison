class NotificationProvider {
  /**
   * Send a notification to a specific user or subscription
   * @param {Object} subscription - Transport specific subscription details
   * @param {Object} payload - The standardized notification payload
   * @param {string} payload.type - e.g., 'PRICE_DROP', 'ALERT_TRIGGERED'
   * @param {string} payload.title - Notification title
   * @param {string} payload.body - Notification body
   * @param {string} payload.actionUrl - URL to open when clicked
   */
  async send(subscription, payload) {
    throw new Error('Not implemented');
  }
}

module.exports = NotificationProvider;
