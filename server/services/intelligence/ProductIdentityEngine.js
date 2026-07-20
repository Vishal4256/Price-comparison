const logger = require('../../utils/logger');

/**
 * Module A: Product Identity Engine
 * Normalizes raw scraper product data into a canonical identity.
 */
class ProductIdentityEngine {
  constructor() {
    this.knownBrands = new Set([
      'apple', 'samsung', 'sony', 'lg', 'asus', 'dell', 'hp', 'lenovo', 
      'oneplus', 'google', 'xiaomi', 'nothing', 'motorola'
    ]);
  }

  /**
   * Main pipeline to extract canonical identity
   * @param {string} rawTitle 
   * @returns {Object} Canonical attributes
   */
  process(rawTitle) {
    if (!rawTitle) return null;
    
    const normalized = rawTitle.toLowerCase().trim();
    
    const brand = this.extractBrand(normalized);
    const storage = this.extractStorage(normalized);
    const ram = this.extractRAM(normalized);
    const color = this.extractColor(normalized);
    const model = this.extractModel(normalized, brand, color, storage, ram);
    
    return {
      brand,
      model,
      storage,
      ram,
      color,
      canonicalId: this.generateCanonicalId({ brand, model, storage, ram })
    };
  }

  extractBrand(text) {
    for (const brand of this.knownBrands) {
      if (text.includes(brand)) return brand;
    }
    return 'unknown';
  }

  extractStorage(text) {
    const match = text.match(/(\d+)\s*(gb|tb)\b/i);
    const storages = text.match(/\b(64|128|256|512)\s*gb\b|\b(1|2)\s*tb\b/i);
    return storages ? storages[0].replace(/\s+/g, '') : null;
  }

  extractRAM(text) {
    const match = text.match(/\b(4|6|8|12|16|32|64)\s*gb\s*ram\b/i);
    return match ? match[1] + 'gb' : null;
  }

  extractColor(text) {
    const colors = ['black', 'white', 'silver', 'gold', 'blue', 'red', 'green', 'midnight', 'starlight', 'graphite'];
    for (const color of colors) {
      if (text.includes(color)) return color;
    }
    return null;
  }

  extractModel(text, brand, color, storage, ram) {
    let model = text;
    if (brand !== 'unknown') model = model.replace(brand, '');
    if (color) model = model.replace(color, '');
    if (storage) {
      model = model.replace(new RegExp(storage, 'ig'), '');
      model = model.replace(/\b(gb|tb)\b/ig, '');
    }
    if (ram) model = model.replace(new RegExp(ram + '\\s*ram', 'ig'), '');
    
    model = model.replace(/[,\(\)-]/g, ' ').replace(/\s+/g, ' ').trim();
    return model || 'unknown';
  }

  generateCanonicalId({ brand, model, storage, ram }) {
    const components = [brand, model];
    if (storage) components.push(storage);
    if (ram) components.push(ram);
    
    return components.join('-').replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').trim('-');
  }
  
  computeSimilarity(identity1, identity2) {
    if (!identity1 || !identity2) return 0;
    
    let score = 0;
    let maxScore = 4;
    
    if (identity1.brand === identity2.brand) score += 1;
    
    if (identity1.model === identity2.model) {
      score += 1;
    } else if (identity1.model.includes(identity2.model) || identity2.model.includes(identity1.model)) {
      score += 0.5; 
    }
    
    if (identity1.storage === identity2.storage) score += 1;
    if (identity1.ram === identity2.ram) score += 1;
    
    if (identity1.storage && identity2.storage && identity1.storage !== identity2.storage) {
      score -= 2;
    }
    
    return Math.max(0, score / maxScore);
  }
}

module.exports = new ProductIdentityEngine();
