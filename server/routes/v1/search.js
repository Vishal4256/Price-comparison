const express = require('express');
const router = express.Router();
const SearchService = require('../../services/SearchService');
const { successResponse } = require('../../utils/response');

router.get('/autocomplete', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return successResponse(res, { suggestions: [] }, req.id);
    }

    // In a production system, this would query SearchHistory, TrackedProducts, and Brands.
    // For now, we return a mock structured response matching the v2.1 spec.
    const mockSuggestions = [
      { text: `${q} 5g`, type: 'trending' },
      { text: `${q} cases`, type: 'category' },
      { text: `${q} latest model`, type: 'ai_suggestion' }
    ];

    successResponse(res, { suggestions: mockSuggestions }, req.id);
  } catch (error) {
    next(error);
  }
});

const RegionService = require('../../services/localization/RegionService');

router.get('/', async (req, res, next) => {
  try {
    const { q, category, brand, minPrice, maxPrice, page, limit } = req.query;
    
    const filters = { category, brand, minPrice, maxPrice };
    const pagination = { 
      page: parseInt(page) || 1, 
      limit: parseInt(limit) || 12 
    };

    const regionContext = RegionService.getRegionContext(req);
    const context = {
      userId: req.user ? req.user.id : null,
      region: regionContext
    };

    const result = await SearchService.executeSearch(q, filters, pagination, context);
    successResponse(res, result, req.id);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
