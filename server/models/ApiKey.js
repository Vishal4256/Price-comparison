const mongoose = require('mongoose');

const ApiKeySchema = new mongoose.Schema({
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // e.g. "Production API"
  keyHash: { type: String, required: true }, // Hashed version of the API Key
  tier: { type: String, enum: ['FREE', 'STARTER', 'BUSINESS', 'ENTERPRISE'], default: 'FREE' },
  status: { type: String, enum: ['ACTIVE', 'REVOKED'], default: 'ACTIVE' },
  lastUsedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('ApiKey', ApiKeySchema);
