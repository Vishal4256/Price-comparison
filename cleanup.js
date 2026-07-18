const fs = require('fs');
const path = require('path');

const backendDir = path.join(__dirname, 'backend');
const frontendDir = path.join(__dirname, 'frontend');

const filesToDelete = [
    // Backend Models
    'models/Alert.js',
    'models/ComparisonAnalytic.js',
    'models/NewsletterSubscription.js',
    'models/Price.js',
    'models/PriceHistory.js',
    'models/Product.js',
    'models/ProductAlias.js',
    'models/Retailer.js',
    'models/RetailerPrice.js',
    'models/ScrapeLog.js',
    'models/SearchAnalytic.js',
    'models/ViewHistory.js',
    'models/Wishlist.js',
    
    // Backend Services
    'services/AffiliateService.js',
    'services/PriceService.js',
    'services/ProductService.js',
    'services/geminiService.js',
    'services/historyService.js',
    'services/matchingService.js',
    'services/recommendationService.js',

    // Backend Controllers
    'controllers/adminController.js',
    'controllers/aiController.js',
    'controllers/alertController.js',
    'controllers/alertsController.js',
    'controllers/homeController.js',
    'controllers/predictionController.js',
    'controllers/priceController.js',
    'controllers/productController.js',
    'controllers/wishlistController.js',

    // Backend Routes
    'routes/adminRoutes.js',
    'routes/aiRoutes.js',
    'routes/alertRoutes.js',
    'routes/historyRoutes.js',
    'routes/homeRoutes.js',
    'routes/predictionRoutes.js',
    'routes/priceHistoryRoutes.js',
    'routes/priceRoutes.js',
    'routes/productRoutes.js',
    'routes/statsRoutes.js',
    'routes/wishlistRoutes.js',

    // Backend Utils (if present)
    'utils/cronJobs.js',
    'utils/productParser.js',
];

const dirsToDelete = [
    'scrapers',
    'scripts'
];

const frontendFilesToDelete = [
    'src/context/CompareContext.jsx',
    'src/components/AIAssistant.jsx',
    'src/components/CategoryCard.jsx',
    'src/components/CompareBar.jsx',
    'src/components/ComparisonSummary.jsx',
    'src/components/PriceAlert.jsx',
    'src/components/PriceChart.jsx',
    'src/components/ProductCard.jsx',
    'src/components/SearchBar.jsx',
    'src/components/SmallProductCard.jsx',
];

const frontendDirsToDelete = [
    'src/components/home'
];

function deleteFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Deleted file:', filePath);
    }
}

function deleteDir(dirPath) {
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log('Deleted directory:', dirPath);
    }
}

console.log('--- Cleaning Backend ---');
filesToDelete.forEach(f => deleteFile(path.join(backendDir, f)));
dirsToDelete.forEach(d => deleteDir(path.join(backendDir, d)));

console.log('\n--- Cleaning Frontend ---');
frontendFilesToDelete.forEach(f => deleteFile(path.join(frontendDir, f)));
frontendDirsToDelete.forEach(d => deleteDir(path.join(frontendDir, d)));

console.log('\nCleanup script completed successfully.');
