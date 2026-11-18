const mongoose = require('mongoose');

const NotificationLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  trackedProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrackedProduct' },
  provider: { type: String, enum: ['email', 'console', 'push', 'sms'], required: true },
  
  subject: { type: String, required: true },
  body: { type: String },
  
  status: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
  error: { type: String },
  
  sentAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('NotificationLog', NotificationLogSchema);
