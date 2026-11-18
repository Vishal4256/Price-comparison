const mongoose = require('mongoose');

const AISummarySchema = new mongoose.Schema({
  canonicalProductId: { type: String, required: true, index: true, unique: true },
  summary: {
    strengths: [{ type: String }],
    drawbacks: [{ type: String }],
    bestUseCases: [{ type: String }],
    recommendation: { type: String }
  },
  model: { type: String, required: true },
  promptVersion: { type: String, default: 'v1' },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }
}, { timestamps: true });

module.exports = mongoose.model('AISummary', AISummarySchema);
