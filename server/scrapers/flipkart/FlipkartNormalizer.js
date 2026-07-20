class FlipkartNormalizer {
  /**
   * Normalize a raw Flipkart scraped item into a standard ProductDTO-like structure.
   * @param {Object} rawData 
   * @returns {Object}
   */
  static normalize(rawData) {
    if (!rawData) return null;

    // Remove commas, Rs symbol from price and parse
    let parsedPrice = null;
    if (rawData.price) {
      const numericString = rawData.price.replace(/[^\d.]/g, '');
      if (numericString) parsedPrice = parseFloat(numericString);
    }

    return {
      retailerId: 'flipkart',
      title: rawData.title,
      price: parsedPrice,
      currency: 'INR',
      url: rawData.url,
      imageUrl: rawData.imageUrl,
      sku: rawData.sku || (rawData.url ? this.extractPid(rawData.url) : null),
      availability: parsedPrice !== null ? 'In Stock' : 'Out of Stock',
      metadata: {}
    };
  }

  static extractPid(url) {
    const match = url.match(/pid=([A-Z0-9]+)/);
    return match ? match[1] : null;
  }
}

module.exports = FlipkartNormalizer;
