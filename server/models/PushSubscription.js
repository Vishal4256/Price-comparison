const mongoose = require('mongoose');

const PushSubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscription: { type: Object, required: true }
}, { timestamps: true });

module.exports = mongoose.model('PushSubscription', PushSubscriptionSchema);
