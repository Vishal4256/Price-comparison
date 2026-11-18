/**
 * Base abstract class for all AI Providers.
 * Ensures a consistent interface regardless of the underlying LLM (Gemini, OpenAI, Claude).
 */
class AIProvider {
  constructor() {
    if (this.constructor === AIProvider) {
      throw new Error("Abstract classes can't be instantiated.");
    }
  }

  /**
   * Generates a structured response based on a prompt and input data.
   * @param {string} promptTemplate The system prompt template
   * @param {string} input The user query or data payload
   * @param {Object} schema Zod schema to validate against (optional depending on provider)
   * @returns {Promise<Object>} Validated structured object
   */
  async generateStructured(promptTemplate, input, schema) {
    throw new Error("Method 'generateStructured()' must be implemented.");
  }
}

module.exports = AIProvider;
