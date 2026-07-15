const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    searchHistory: [{
        query: { type: String, required: true },
        resultsFound: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now }
    }],
    phone: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    lastLogin: { type: Date, default: Date.now },
    tokenVersion: { type: Number, default: 0 },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        browser: { type: Boolean, default: true }
    }
}, { timestamps: true });


userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
