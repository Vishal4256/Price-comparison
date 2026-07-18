const analyticsEngine = require('../services/analyticsEngine');
const aiDecisionEngine = require('../services/aiDecisionEngine');

exports.getUserDashboard = async (req, res) => {
    try {
        const metrics = await analyticsEngine.getUserDashboardMetrics(req.user._id);
        const aiSummary = await aiDecisionEngine.summarizeUserDashboard(metrics);
        
        res.status(200).json({ 
            success: true, 
            data: { ...metrics, aiSummary } 
        });
    } catch (error) {
        console.error('Error fetching user dashboard:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user dashboard metrics' });
    }
};

exports.getAdminDashboard = async (req, res) => {
    try {
        const metrics = await analyticsEngine.getAdminDashboardMetrics();
        res.status(200).json({ success: true, data: metrics });
    } catch (error) {
        console.error('Error fetching admin dashboard:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch admin dashboard metrics' });
    }
};

exports.getScraperDashboard = async (req, res) => {
    try {
        const metrics = await analyticsEngine.getScraperHealthMetrics();
        res.status(200).json({ success: true, data: metrics });
    } catch (error) {
        console.error('Error fetching scraper dashboard:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch scraper health metrics' });
    }
};

exports.getSearchAnalytics = async (req, res) => {
    try {
        const { days } = req.query;
        const metrics = await analyticsEngine.getSearchAnalytics(Number(days) || 7);
        res.status(200).json({ success: true, data: metrics });
    } catch (error) {
        console.error('Error fetching search analytics:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch search analytics' });
    }
};
