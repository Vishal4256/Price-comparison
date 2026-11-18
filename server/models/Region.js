const mongoose = require('mongoose');

const RegionSchema = new mongoose.Schema({
  countryCode: { type: String, required: true, unique: true }, // e.g. IN, US, DE
  countryName: { type: String, required: true },
  currencyCode: { type: String, required: true }, // e.g. INR, USD, EUR
  languageLocale: { type: String, required: true }, // e.g. en-IN, en-US, de-DE
  timezone: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  defaultRetailers: [{ type: String }] // Array of string names or ObjectIds
}, {
  timestamps: true
});

module.exports = mongoose.model('Region', RegionSchema);
