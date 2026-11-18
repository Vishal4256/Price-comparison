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
    if (rawData.price !== null && rawData.price !== undefined) {
      if (typeof rawData.price === 'string') {
        const numericString = rawData.price.replace(/[^\d.]/g, '');
        if (numericString) parsedPrice = parseFloat(numericString);
      } else {
        parsedPrice = rawData.price;
      }
    }

    const finalUrl = rawData.url || rawData.productUrl;

    return {
      retailerId: 'flipkart',
      title: rawData.title,
      price: parsedPrice,
      currency: 'INR',
      url: finalUrl,
      imageUrl: rawData.imageUrl || rawData.image,
      sku: rawData.sku || (finalUrl ? this.extractPid(finalUrl) : null),
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
