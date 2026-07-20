const express = require('express');
const router = express.Router();
const CompareService = require('../../services/CompareService');
const { successResponse } = require('../../utils/response');
const { ValidationError } = require('../../errors/AppError');

router.post('/', async (req, res, next) => {
  try {
    const { productIds } = req.body;
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      throw new ValidationError('An array of productIds is required');
    }
    const result = await CompareService.compareProducts(productIds);
    successResponse(res, result, req.id);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
