const express = require('express');
const router = express.Router();
const Product = require('../../../models/Product');
const publicApiAuth = require('../../../middlewares/publicApiAuth');
const SearchAnalytics = require('../../../services/search/SearchAnalytics');

router.use(publicApiAuth);

/**
 * @swagger
 * /api/public/v1/search:
 *   get:
 *     summary: Search for products (Public API)
 *     tags: [Public API]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    const products = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit))
    .select('name brand category currentPrices lowestPrice imageUrl');

    // Log the search for our analytics
    SearchAnalytics.logSearch(q, req.partner._id).catch(() => {});

    res.json({
      query: q,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/public/v1/products/{id}:
 *   get:
 *     summary: Get product details by ID
 *     tags: [Public API]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 */
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('name brand category currentPrices lowestPrice imageUrl description attributes');
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ data: product });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
