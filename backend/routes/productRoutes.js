const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Unified Product API endpoint
router.get('/:id', productController.getProductDetails);

// Optional: async endpoint just for fetching AI Analysis
router.get('/:id/analysis', productController.getProductAnalysis);

module.exports = router;
