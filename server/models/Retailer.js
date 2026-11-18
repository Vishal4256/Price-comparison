const mongoose = require('mongoose');

const RetailerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  logo: { type: String },
  website: { type: String },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Retailer', RetailerSchema);
