const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const AffiliateService = require('./services/AffiliateService');
const PriceService = require('./services/PriceService');

dotenv.config();

async function cleanDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for cleanup...");

        const allProducts = await Product.find({});
        console.log(`Total products before cleanup: ${allProducts.length}`);

        let deletedCount = 0;
        let fixedCount = 0;

        for (const product of allProducts) {
            let needsSave = false;
            let shouldDelete = false;

            // Check valid price
            const validPrice = PriceService.validatePrice(product.currentPrice);
            if (!validPrice) {
                console.log(`Deleting product due to invalid price: ${product.title} (${product.currentPrice})`);
                shouldDelete = true;
            }

            // Check valid URL
            const validUrl = AffiliateService.validateUrl(product.url);
            if (!validUrl) {
                console.log(`Deleting product due to invalid URL: ${product.title} (${product.url})`);
                shouldDelete = true;
            } else if (validUrl !== product.url) {
                product.url = validUrl;
                needsSave = true;
            }

            // Check missing image or title
            if (!product.title || !product.image) {
                console.log(`Deleting product due to missing title or image: ID ${product._id}`);
                shouldDelete = true;
            }

            if (shouldDelete) {
                await Product.findByIdAndDelete(product._id);
                deletedCount++;
            } else if (needsSave) {
                await product.save();
                fixedCount++;
            }
        }

        console.log(`\nCleanup Complete!`);
        console.log(`Deleted ${deletedCount} invalid products.`);
        console.log(`Fixed ${fixedCount} products.`);
        console.log(`Remaining valid products: ${allProducts.length - deletedCount}`);

    } catch (error) {
        console.error("Cleanup failed:", error);
    } finally {
        mongoose.connection.close();
        process.exit(0);
    }
}

cleanDatabase();
