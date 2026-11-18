const mongoose = require('mongoose');

const ProductFeedJobSchema = new mongoose.Schema({
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  status: { type: String, enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'], default: 'QUEUED' },
  progress: { type: Number, default: 0 },
  importedRecords: { type: Number, default: 0 },
  rejectedRecords: { type: Number, default: 0 },
  validationErrors: [{
    row: Number,
    severity: { type: String, enum: ['FATAL', 'RECOVERABLE', 'INFO'] },
    message: String
  }],
  fileUrl: { type: String }, // Where the uploaded CSV/XML is stored temporarily
  completedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductFeedJob', ProductFeedJobSchema);
