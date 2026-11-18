const express = require('express');
const router = express.Router();
const ProductService = require('../../services/ProductService');
const { successResponse } = require('../../utils/response');

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await ProductService.getProductDetails(id);
    successResponse(res, result, req.id);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
