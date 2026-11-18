const express = require('express');
const router = express.Router();
const WebPushProvider = require('../../services/notifications/WebPushProvider');
const logger = require('../../utils/logger');
const PushSubscription = require('../../models/PushSubscription');
const { requireAuth } = require('../../middlewares/auth');

router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const { subscription } = req.body;
    
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }

    // Save this subscription to MongoDB associated with req.user.id
    // Upsert to avoid duplicates for the same endpoint
    await PushSubscription.findOneAndUpdate(
      { 'subscription.endpoint': subscription.endpoint },
      { user: req.user.id, subscription },
      { upsert: true, new: true }
    );
    logger.info(`Received and saved new Web Push subscription for user: ${req.user.id}`);

    // Send a welcome notification immediately as proof of concept
    const welcomePayload = {
      type: 'INFO',
      title: 'Welcome to PriceSmart',
      body: 'You are now subscribed to price drop alerts!',
      actionUrl: '/alerts'
    };
    
    // Async send (don't await so we don't block response)
    WebPushProvider.send(subscription, welcomePayload).catch(e => logger.error('WebPush init fail:', e.message));

    res.status(201).json({ success: true, message: 'Subscription saved.' });
  } catch (error) {
    logger.error(`Error saving subscription: ${error.message}`);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
