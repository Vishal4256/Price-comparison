const express = require('express');
const router = express.Router();
const HomeService = require('../../services/HomeService');
const { successResponse } = require('../../utils/response');

router.get('/', async (req, res, next) => {
  try {
    const result = await HomeService.getHomeData();
    successResponse(res, result, req.id);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
