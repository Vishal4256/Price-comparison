const aiDecisionEngine = require('../services/aiDecisionEngine');

exports.getDealScore = async (req, res) => {
    try {
        const { productId, currentPrice, productTitle } = req.body;
        if (!productId || !currentPrice) {
            return res.status(400).json({ success: false, message: 'Missing productId or currentPrice' });
        }
        
        const result = await aiDecisionEngine.getDealScore(productId, currentPrice, productTitle);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in getDealScore:', error);
        res.status(500).json({ success: false, message: 'Failed to calculate deal score' });
    }
};

exports.getRecommendation = async (req, res) => {
    try {
        const { productId, currentPrice, productTitle } = req.body;
        if (!productId || !currentPrice) {
            return res.status(400).json({ success: false, message: 'Missing productId or currentPrice' });
        }
        
        const result = await aiDecisionEngine.getRecommendation(productId, currentPrice, productTitle);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in getRecommendation:', error);
        res.status(500).json({ success: false, message: 'Failed to generate recommendation' });
    }
};

exports.detectFakeDiscount = async (req, res) => {
    try {
        const { productId, currentPrice, advertisedMrp, productTitle } = req.body;
        if (!productId || !currentPrice) {
            return res.status(400).json({ success: false, message: 'Missing productId or currentPrice' });
        }
        
        const result = await aiDecisionEngine.detectFakeDiscount(productId, currentPrice, advertisedMrp, productTitle);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in detectFakeDiscount:', error);
        res.status(500).json({ success: false, message: 'Failed to evaluate discount' });
    }
};
