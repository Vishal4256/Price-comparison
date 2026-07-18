const Notification = require('../models/Notification');
const couponEngine = require('../services/couponEngine');
const cashbackEngine = require('../services/cashbackEngine');
const aiDecisionEngine = require('../services/aiDecisionEngine'); // AI summarized notifications!

exports.getNotifications = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await Notification.countDocuments({ userId: req.user._id });
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({ 
            success: true, 
            data: notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isRead: true },
            { new: true }
        );
        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        console.error('Error marking notification read:', error);
        res.status(500).json({ success: false, message: 'Failed to mark read' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ success: true, message: 'All marked as read' });
    } catch (error) {
        console.error('Error marking all read:', error);
        res.status(500).json({ success: false, message: 'Failed to mark all read' });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        res.status(200).json({ success: true, message: 'Deleted' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ success: false, message: 'Failed to delete' });
    }
};

// Coupons & Cashback APIs
exports.getCoupons = async (req, res) => {
    try {
        const { productId } = req.params;
        const { retailer } = req.query;
        if (!retailer) return res.status(400).json({ success: false, message: 'Retailer is required' });

        const coupons = await couponEngine.getCouponsForProduct(productId, retailer);
        res.status(200).json({ success: true, data: coupons });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
    }
};

exports.getCashback = async (req, res) => {
    try {
        const { productId } = req.params;
        const { retailer } = req.query;
        if (!retailer) return res.status(400).json({ success: false, message: 'Retailer is required' });

        const cashback = await cashbackEngine.getCashbackOffers(productId, retailer);
        res.status(200).json({ success: true, data: cashback });
    } catch (error) {
        console.error('Error fetching cashback:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch cashback' });
    }
};
