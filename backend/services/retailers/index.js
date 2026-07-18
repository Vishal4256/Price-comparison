const registry = require('./registry');

// Import Adapters
const amazonRetailer = require('./adapters/amazon');
// const flipkartRetailer = require('./adapters/flipkart');

// Register them all
registry.register(amazonRetailer);
// registry.register(flipkartRetailer);

console.log('[Retailer Module] Initialized and registered adapters.');

module.exports = registry;
