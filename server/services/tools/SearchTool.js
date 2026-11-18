const SearchService = require('../SearchService');

class SearchTool {
  constructor() {
    this.name = 'search';
    this.description = 'Searches the universal catalog for products matching a query.';
  }

  async execute(args, context) {
    const { query } = args;
    // Pass context to universal search
    const results = await SearchService.executeSearch(query, {}, { page: 1, limit: 3 }, context);
    
    return {
      success: true,
      data: results.products,
      meta: results.meta
    };
  }
}

module.exports = new SearchTool();
