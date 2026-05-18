const User = require('../models/User');
const Product = require('../models/Product');
const Price = require('../models/Price');
const ScrapeLog = require('../models/ScrapeLog');
const { scrapeProduct } = require('../scrapers/scraper');

// @desc  Get admin stats
// @route GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [userCount, productCount, priceCount, scrapeCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Price.countDocuments(),
      ScrapeLog.countDocuments(),
    ]);
    res.json({ success: true, stats: { users: userCount, products: productCount, priceRecords: priceCount, scrapes: scrapeCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all users
// @route GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all products
// @route GET /api/admin/products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get scrape logs
// @route GET /api/admin/logs
const getLogs = async (req, res) => {
  try {
    const logs = await ScrapeLog.find().sort({ timestamp: -1 }).limit(50);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Trigger manual price update
// @route POST /api/admin/scrape
const triggerScrape = async (req, res) => {
  try {
    // Find products that haven't been scraped recently or prioritize by manual request
    const products = await Product.find({ isActive: true })
      .sort({ lastScraped: 1 })
      .limit(20);
    
    const results = [];

    for (const product of products) {
      try {
        const scraped = await scrapeProduct(product.searchQuery || product.name);
        if (scraped && scraped.prices) {
          for (const p of scraped.prices) {
            await Price.create({ productId: product._id, ...p, timestamp: new Date() });
          }
          product.lastScraped = new Date();
          await product.save();
          results.push({ product: product.name, status: 'success' });
          await ScrapeLog.create({ productName: product.name, status: 'success' });
        }
      } catch (e) {
        results.push({ product: product.name, status: 'error', error: e.message });
        await ScrapeLog.create({ productName: product.name, status: 'error', error: e.message });
      }
    }

    res.json({ success: true, message: `Updated prices for ${results.length} products`, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Export addScrapeLog for cron job to use
const addScrapeLog = async (entry) => {
  try {
    await ScrapeLog.create({
      productName: entry.product,
      status: entry.status,
      error: entry.error,
      timestamp: entry.timestamp || new Date()
    });
  } catch (err) {
    console.error('Error adding scrape log:', err.message);
  }
};

module.exports = { getStats, getUsers, getProducts, getLogs, triggerScrape, addScrapeLog };
