const mongoose = require('mongoose');

const ExchangeRateSchema = new mongoose.Schema({
  baseCurrency: { type: String, required: true, default: 'USD' },
  targetCurrency: { type: String, required: true },
  rate: { type: Number, required: true },
  provider: { type: String, default: 'MockExchangeRateAPI' },
  lastFetchedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
}, {
  timestamps: true
});

ExchangeRateSchema.index({ baseCurrency: 1, targetCurrency: 1 }, { unique: true });

module.exports = mongoose.model('ExchangeRate', ExchangeRateSchema);
