const SearchTool = require('../tools/SearchTool');

class SearchAgent {
  async execute(context) {
    // Determine query from context
    const query = context.query || 'latest smartphone';
    
    // Execute tool
    const result = await SearchTool.execute({ query }, context);
    
    // Format response
    if (result.success && result.data.length > 0) {
      const topProduct = result.data[0];
      
      return {
        content: `I found several options for "${query}". The top match is the ${topProduct.title} for ${topProduct.lowestPrice}.`,
        structuredData: { products: result.data },
        contextUpdates: {
          activeProducts: result.data.map(p => p.groupId)
        }
      };
    } else {
      return {
        content: `I couldn't find any products matching "${query}" in your region.`,
        structuredData: {},
        contextUpdates: {}
      };
    }
  }
}

module.exports = new SearchAgent();
