/**
 * Abstract interface for Search Intent Classifiers.
 */
class IntentClassifier {
  constructor() {
    if (this.constructor === IntentClassifier) {
      throw new Error("Abstract classes can't be instantiated.");
    }
  }

  /**
   * Parse the user's raw query and classify the search intent.
   * @param {string} query 
   * @returns {Promise<Object>} An object containing interpreted intent (e.g., category, expected retailers, brand, price constraints).
   */
  async classify(query) {
    throw new Error("Method 'classify()' must be implemented.");
  }
}

module.exports = IntentClassifier;
