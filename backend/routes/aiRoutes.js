const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/deal-score', protect, aiController.getDealScore);
router.post('/recommendation', protect, aiController.getRecommendation);
router.post('/fake-discount', protect, aiController.detectFakeDiscount);

module.exports = router;
