const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const Merchant = require('../../models/Merchant');
const AffiliateClick = require('../../models/AffiliateClick');
const affiliateRouter = require('../../services/affiliate/AffiliateRouter');
const logger = require('../../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * @swagger
 * /api/v1/out/redirect:
 *   get:
 *     summary: Redirects to merchant and logs affiliate click
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: merchantName
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: campaign
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects to merchant tracking URL
 */
router.get('/redirect', async (req, res) => {
  try {
    const { productId, merchantName, campaign } = req.query;

    if (!productId || !merchantName) {
      return res.status(400).send('Missing required parameters');
    }

    // 1. Fetch Product to get the original URL
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Find the specific retailer's URL from the product
    const priceEntry = product.currentPrices.find(p => p.retailer.toLowerCase() === merchantName.toLowerCase());
    if (!priceEntry) {
      return res.status(404).send('Merchant price not found for this product');
    }

    const originalUrl = priceEntry.url;

    // 2. Generate Tracking URL
    const trackingUrl = affiliateRouter.generateLink(originalUrl, campaign);

    // 3. Log the click asynchronously
    // We don't await this so the redirect is instantaneous
    const sessionId = req.headers['x-session-id'] || uuidv4();
    
    // Attempt to resolve Merchant ID if we have them in the DB
    let merchantId = null;
    try {
      const merchant = await Merchant.findOne({ name: new RegExp('^' + merchantName + '$', 'i') });
      if (merchant) merchantId = merchant._id;
    } catch (e) {
      // Ignore merchant lookup failure
    }

    AffiliateClick.create({
      merchantId,
      merchantName: merchantName,
      productId: product._id,
      userId: req.user ? req.user.id : null,
      sessionId,
      campaign: campaign || 'organic',
      referralSource: req.get('Referrer') || 'direct',
      targetUrl: trackingUrl
    }).catch(err => logger.error(`Failed to log affiliate click: ${err.message}`));

    // 4. Perform HTTP 302 Redirect
    return res.redirect(302, trackingUrl);
  } catch (error) {
    logger.error(`Error in out/redirect: ${error.message}`);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
