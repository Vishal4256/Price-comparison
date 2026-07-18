const mongoose = require('mongoose');

const searchAnalyticsSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        index: true 
    },
    query: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String 
    },
    timestamp: { 
        type: Date, 
        default: Date.now,
        index: true 
    },
    retailersQueried: { 
        type: [String],
        default: []
    },
    resultCount: { 
        type: Number, 
        default: 0 
    },
    responseTime: { 
        type: Number // in milliseconds
    },
    clickedProductId: { 
        type: String 
    }
});

// Compound index for trending searches in a timeframe
searchAnalyticsSchema.index({ timestamp: -1, query: 1 });

module.exports = mongoose.model('SearchAnalytics', searchAnalyticsSchema);
