class EmbeddingProvider {
  /**
   * Generates a vector embedding for a given text.
   * @param {string} text 
   * @returns {Promise<number[]>}
   */
  async generateEmbedding(text) {
    throw new Error('Method "generateEmbedding()" must be implemented.');
  }

  /**
   * Generates embeddings for multiple texts.
   * @param {string[]} texts 
   * @returns {Promise<number[][]>}
   */
  async generateEmbeddings(texts) {
    throw new Error('Method "generateEmbeddings()" must be implemented.');
  }

  /**
   * Returns the name and version of the model used (e.g. 'gemini-text-embedding-004')
   * @returns {string}
   */
  getModelVersion() {
    throw new Error('Method "getModelVersion()" must be implemented.');
  }
}

module.exports = EmbeddingProvider;
