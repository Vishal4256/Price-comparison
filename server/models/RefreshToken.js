const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date }
}, { timestamps: true });

// Auto-delete expired tokens (TTL Index)
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
