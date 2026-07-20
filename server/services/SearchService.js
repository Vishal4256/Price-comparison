const SearchPipelineService = require('./SearchPipelineService');
const ProductRepository = require('../repositories/ProductRepository');

class SearchService {
  /**
   * Execute search by delegating to the universal SearchPipelineService.
   */
  async executeSearch(query, filters = {}, pagination = { page: 1, limit: 12 }, context = {}) {
    // Pipeline handles scraping, caching, matching, and ranking
    const pipelineResult = await SearchPipelineService.execute(query, context);

    const total = pipelineResult.results.length;
    
    // Manual pagination applied to the pipeline results
    const skip = (pagination.page - 1) * pagination.limit;
    const paginatedResults = pipelineResult.results.slice(skip, skip + pagination.limit);

    return {
      query: pipelineResult.query,
      intent: pipelineResult.intent,
      products: paginatedResults,
      filters: {
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 200000 }
      },
      pagination: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit)
      },
      meta: pipelineResult.meta
    };
  }
}

module.exports = new SearchService();
