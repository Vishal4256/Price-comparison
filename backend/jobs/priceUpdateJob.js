const cron = require('node-cron');
const Product = require('../models/Product');
const Price = require('../models/Price');
const { scrapeProduct } = require('../scrapers/scraper');
const { checkAllAlerts } = require('../controllers/alertsController');

// Run every 6 hours: 0 */6 * * *
// Run every minute for testing: * * * * *
cron.schedule('0 */6 * * *', async () => {
  console.log('⏰ [CRON] Starting scheduled price update...');
  try {
    const products = await Product.find({ isActive: true });
    let updated = 0;

    for (const product of products) {
      try {
        const scraped = await scrapeProduct(product.searchQuery || product.name);
        for (const p of scraped.prices) {
          await Price.create({ productId: product._id, ...p, timestamp: new Date() });
        }
        product.lastScraped = new Date();
        await product.save();
        updated++;
      } catch (e) {
        console.error(`[CRON] Error updating ${product.name}:`, e.message);
      }
    }

    console.log(`✅ [CRON] Updated prices for ${updated}/${products.length} products`);

    // Check all price alerts
    await checkAllAlerts();
    console.log('✅ [CRON] Alert check complete');
  } catch (err) {
    console.error('[CRON] Job failed:', err.message);
  }
});

console.log('⏰ Cron job scheduled: price updates every 6 hours');
