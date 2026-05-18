const express = require('express');
const { createAlert, getUserAlerts, deleteAlert } = require('../controllers/alertController');
const { protect } = require('../utils/authMiddleware');
const router = express.Router();

router.use(protect);
router.post('/', createAlert);
router.get('/', getUserAlerts);
router.delete('/:id', deleteAlert);

module.exports = router;
