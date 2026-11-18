const mongoose = require('mongoose');

const ConversationEventSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  role: { type: String, enum: ['USER', 'ASSISTANT', 'SYSTEM', 'TOOL'], required: true },
  content: { type: String }, // Raw text content
  structuredData: { type: Object }, // JSON output for UI rendering (e.g. products, evidence)
  toolCalls: [{
    tool: { type: String },
    arguments: { type: Object },
    result: { type: Object },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'] }
  }],
  meta: {
    latencyMs: { type: Number },
    tokensUsed: { type: Number }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ConversationEvent', ConversationEventSchema);
