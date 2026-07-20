const express = require('express');
const router = express.Router();
const DashboardService = require('../../services/DashboardService');
const { successResponse } = require('../../utils/response');
const { requireAuth } = require('../../middlewares/auth');

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await DashboardService.getDashboardData(userId);
    successResponse(res, result, req.id);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
