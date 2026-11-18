const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  resourceType: { type: String }, // e.g., 'API_KEY', 'MERCHANT_FEED'
  resourceId: { type: String },
  details: { type: Object },
  ipAddress: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
