const IntentClassifier = require('./IntentClassifier');

class RuleBasedClassifier extends IntentClassifier {
  async classify(query) {
    // A rudimentary rule-based engine.
    // In v1.3.0, GeminiClassifier will replace this with a real LLM prompt.
    const intent = {
      originalQuery: query,
      normalizedQuery: query.toLowerCase().trim(),
      category: 'unknown',
      suggestedRetailers: [],
      brand: null,
    };

    const q = intent.normalizedQuery;

    // Simple keyword-based category extraction
    if (q.match(/\b(phone|smartphone|iphone|samsung|pixel|mobile)\b/)) {
      intent.category = 'electronics';
      intent.suggestedRetailers = ['amazon', 'flipkart', 'croma', 'reliance'];
    } else if (q.match(/\b(tv|television|smart tv)\b/)) {
      intent.category = 'electronics';
      intent.suggestedRetailers = ['amazon', 'flipkart', 'croma'];
    } else if (q.match(/\b(shirt|t-shirt|jeans|dress|shoes)\b/)) {
      intent.category = 'fashion';
      intent.suggestedRetailers = ['myntra', 'ajio', 'amazon', 'flipkart'];
    } else if (q.match(/\b(makeup|lipstick|shampoo|skincare)\b/)) {
      intent.category = 'beauty';
      intent.suggestedRetailers = ['nykaa', 'amazon', 'flipkart'];
    }

    // Default to a broad retailer set if unknown
    if (intent.suggestedRetailers.length === 0) {
      intent.suggestedRetailers = ['amazon', 'flipkart'];
    }

    return intent;
  }
}

module.exports = new RuleBasedClassifier();
