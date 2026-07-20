const mongoose = require('mongoose');

const productEmbeddingSchema = new mongoose.Schema({
  canonicalId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: String,
  brand: String,
  category: String,
  vector: {
    type: [Number], // Array of floats representing the embedding vector
    required: true
  },
  modelVersion: {
    type: String,
    required: true // e.g., 'gemini-embedding-001'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ProductEmbedding', productEmbeddingSchema);
