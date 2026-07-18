const priceIntelligence = require('../services/priceIntelligence');

exports.getHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const days = parseInt(req.query.days) || 30;
        
        const history = await priceIntelligence.getHistory(id, days);
        
        res.status(200).json({ success: true, count: history.length, data: history });
    } catch (error) {
        console.error('Error fetching price history:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch price history' });
    }
};

exports.getStatistics = async (req, res) => {
    try {
        const { id } = req.params;
        
        const stats = await priceIntelligence.getPriceSummary(id);
        
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching price statistics:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch price statistics' });
    }
};

exports.recordPrice = async (req, res) => {
    try {
        // Internal endpoint, should ideally be protected by a service key in production
        const { productId, retailer, price, shipping, currency, inStock, source } = req.body;
        
        if (!productId || !retailer || price === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const result = await priceIntelligence.recordPrice(productId, retailer, price, shipping, currency, inStock, source);
        
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Error recording price:', error);
        res.status(500).json({ success: false, message: 'Failed to record price' });
    }
};
