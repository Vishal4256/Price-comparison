const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  sessionId: { type: String, required: true, index: true }, // Cookie or temporary ID for guests
  status: { type: String, enum: ['ACTIVE', 'ARCHIVED'], default: 'ACTIVE' },
  context: {
    region: { type: Object },
    budget: { type: Number },
    preferredBrands: [{ type: String }],
    activeProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
  },
  expiresAt: { type: Date, required: true },
  metadata: { type: Object }
}, {
  timestamps: true
});

module.exports = mongoose.model('Conversation', ConversationSchema);
