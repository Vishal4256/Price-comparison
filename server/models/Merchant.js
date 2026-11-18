const mongoose = require('mongoose');

const MerchantSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  website: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'ACTIVE', 'SUSPENDED'], default: 'PENDING' },
  feedType: { type: String, enum: ['API', 'CSV', 'SCRAPER'], default: 'CSV' },
  supportedCategories: [{ type: String }],
  healthStatus: { type: String, enum: ['HEALTHY', 'DEGRADED', 'FAILING'], default: 'HEALTHY' },
  contactEmail: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Merchant', MerchantSchema);
