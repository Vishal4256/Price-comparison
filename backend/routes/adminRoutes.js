const express = require('express');
const router = express.Router();
const { getStats, getUsers, getProducts, getLogs, triggerScrape } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/products', getProducts);
router.get('/logs', getLogs);
router.post('/scrape', triggerScrape);

module.exports = router;
