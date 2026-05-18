const mongoose = require('mongoose');

const scrapeLogSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    status: { type: String, enum: ['success', 'error'], required: true },
    error: { type: String },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ScrapeLog', scrapeLogSchema);
