const mongoose = require('mongoose');

const AILogSchema = new mongoose.Schema({
  feature: { type: String, required: true }, // e.g., 'intent', 'summary', 'deal_explanation'
  model: { type: String, required: true },
  tokens: {
    prompt: { type: Number, default: 0 },
    completion: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  latency: { type: Number, required: true },
  cacheHit: { type: Boolean, default: false },
  success: { type: Boolean, required: true },
  error: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AILog', AILogSchema);
