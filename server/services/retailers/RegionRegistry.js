class RegionRegistry {
  constructor() {
    // In production, this data is fetched from MongoDB Retailer & Region models.
    this.registry = {
      'IN': ['Amazon India', 'Flipkart', 'Croma', 'Reliance Digital'],
      'US': ['Amazon US', 'Best Buy', 'Walmart', 'Target'],
      'DE': ['Amazon Germany', 'MediaMarkt', 'Saturn', 'Fnac'],
      'GB': ['Amazon UK', 'Currys', 'Argos']
    };
  }

  /**
   * Get valid retailers for a given region context
   * @param {Object} regionContext 
   * @returns {Array<string>} list of retailer names
   */
  getRetailersForRegion(regionContext) {
    return this.registry[regionContext.country] || [];
  }
}

module.exports = new RegionRegistry();
