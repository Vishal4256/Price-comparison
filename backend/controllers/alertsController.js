const User = require('../models/User');
const Product = require('../models/Product');
const Price = require('../models/Price');
const { sendPriceAlert } = require('../services/emailService');

// @desc  Create price alert
// @route POST /api/alerts/create
const createAlert = async (req, res) => {
  try {
    const { productId, targetPrice, website = 'any' } = req.body;
    if (!productId || !targetPrice) {
      return res.status(400).json({ success: false, message: 'productId and targetPrice required' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const user = await User.findById(req.user._id);
    user.alerts.push({ productId, targetPrice: parseFloat(targetPrice), website });
    await user.save();

    res.status(201).json({ success: true, message: 'Price alert created', alert: user.alerts[user.alerts.length - 1] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get user alerts
// @route GET /api/alerts
const getAlerts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('alerts.productId');
    res.json({ success: true, alerts: user.alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete alert
// @route DELETE /api/alerts/:alertId
const deleteAlert = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.alerts = user.alerts.filter((a) => a._id.toString() !== req.params.alertId);
    await user.save();
    res.json({ success: true, message: 'Alert deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Check all active alerts (called by cron job)
const checkAllAlerts = async () => {
  try {
    const users = await User.find({ 'alerts.active': true });
    for (const user of users) {
      for (const alert of user.alerts.filter((a) => a.active)) {
        const priceQuery = { productId: alert.productId };
        if (alert.website !== 'any') priceQuery.website = alert.website;

        const latestPrices = await Price.find(priceQuery).sort({ timestamp: -1 }).limit(3);
        const minPrice = latestPrices.length ? Math.min(...latestPrices.map((p) => p.price)) : Infinity;

        if (minPrice <= alert.targetPrice) {
          const product = await Product.findById(alert.productId);
          const cheapestRecord = latestPrices.find((p) => p.price === minPrice);

          await sendPriceAlert({
            toEmail: user.email,
            userName: user.name,
            productName: product?.name || 'Product',
            currentPrice: minPrice,
            targetPrice: alert.targetPrice,
            website: cheapestRecord?.website || 'Various',
            link: cheapestRecord?.link || '#',
          });

          // Deactivate alert after firing
          alert.active = false;
          await user.save();
          console.log(`✉️ Alert sent to ${user.email} for product ${product?.name}`);
        }
      }
    }
  } catch (err) {
    console.error('checkAllAlerts error:', err.message);
  }
};

module.exports = { createAlert, getAlerts, deleteAlert, checkAllAlerts };
