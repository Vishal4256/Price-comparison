const express = require('express');
const { 
    searchProducts, 
    getProductDetails, 
    saveProduct, 
    getTrendingDeals, 
    getAdminStats,
    getSuggestions,
    getSimilarProducts,
    getPublicStats
} = require('../controllers/productController');
const router = express.Router();
const { optionalProtect } = require('../middleware/auth');

router.get('/search', optionalProtect, searchProducts);
router.get('/suggestions', optionalProtect, getSuggestions);

router.get('/trending', getTrendingDeals);
router.get('/admin/stats', getAdminStats);
router.get('/public-stats', getPublicStats);
router.get('/similar/:id', getSimilarProducts);
router.get('/:id', getProductDetails);
router.post('/save', saveProduct);


module.exports = router;

