const express = require('express');
const router = express.Router();
const WebPushProvider = require('../../services/notifications/WebPushProvider');
const logger = require('../../utils/logger');
// Mocking DB model for subscriptions. In a real app this is a Mongoose model.
// const PushSubscription = require('../../models/PushSubscription');

router.post('/subscribe', async (req, res) => {
  try {
    const { subscription } = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }

    // In production, save this subscription to MongoDB associated with req.user.id
    // await PushSubscription.create({ userId: req.user.id, subscription });
    logger.info(`Received new Web Push subscription: ${subscription.endpoint}`);

    // Send a welcome notification immediately as proof of concept
    const welcomePayload = {
      type: 'INFO',
      title: 'Welcome to PriceSmart',
      body: 'You are now subscribed to price drop alerts!',
      actionUrl: '/alerts'
    };
    
    // Async send (don't await so we don't block response)
    WebPushProvider.send(subscription, welcomePayload);

    res.status(201).json({ success: true, message: 'Subscription saved.' });
  } catch (error) {
    logger.error(`Error saving subscription: ${error.message}`);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
