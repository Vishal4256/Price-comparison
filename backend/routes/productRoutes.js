const express = require('express');
const { 
    searchProducts, 
    getProductDetails, 
    saveProduct, 
    getTrendingDeals, 
    getAdminStats,
    getSuggestions,
    getSimilarProducts,
    getPublicStats,
    getFeaturedProducts
} = require('../controllers/productController');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.get('/search', protect, searchProducts);
router.get('/suggestions', protect, getSuggestions);

router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingDeals);
router.get('/admin/stats', getAdminStats);
router.get('/public-stats', getPublicStats);
router.get('/similar/:id', protect, getSimilarProducts);
router.get('/:id', protect, getProductDetails);
router.post('/save', protect, saveProduct);

module.exports = router;

