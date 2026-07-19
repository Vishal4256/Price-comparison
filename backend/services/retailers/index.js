const registry = require('./registry');

// Real scrapers (Cheerio-based, return [] when blocked — never mock data)
const amazonRetailer = require('./adapters/amazon');
const flipkartRetailer = require('./adapters/flipkart');

// Register all active retailers
registry.register(amazonRetailer);
registry.register(flipkartRetailer);

console.log('[Retailer Module] Initialized and registered adapters: Amazon, Flipkart');

module.exports = registry;
