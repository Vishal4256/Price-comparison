const Price = require('../models/Price');
const Product = require('../models/Product');

// @desc  Get price history for a product
// @route GET /api/price-history/:productId
const getPriceHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    const { website, days = 30 } = req.query;

    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const filter = { productId, timestamp: { $gte: since } };
    if (website) filter.website = website;

    const prices = await Price.find(filter).sort({ timestamp: 1 });

    // Group by website for chart data
    const grouped = {};
    for (const p of prices) {
      if (!grouped[p.website]) grouped[p.website] = [];
      grouped[p.website].push({ price: p.price, timestamp: p.timestamp });
    }

    res.json({ success: true, history: grouped, rawPrices: prices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get price comparison across sites
// @route GET /api/prices/compare/:productId
const comparePrice = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const prices = await Price.find({ productId }).sort({ timestamp: -1 }).limit(20);
    const comparison = {};
    for (const p of prices) {
      if (!comparison[p.website]) {
        comparison[p.website] = { price: p.price, link: p.link, availability: p.availability };
      }
    }

    const priceValues = Object.values(comparison).map((c) => c.price);
    const lowestPrice = Math.min(...priceValues);
    const highestPrice = Math.max(...priceValues);
    const lowestSite = Object.entries(comparison).find(([, v]) => v.price === lowestPrice)?.[0];

    res.json({
      success: true,
      product,
      comparison,
      lowestPrice,
      highestPrice,
      lowestSite,
      savings: highestPrice - lowestPrice,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getPriceHistory, comparePrice };
