const Alert = require('../models/Alert');

exports.createAlert = async (req, res) => {
    try {
        const { productId, targetPrice, email } = req.body;
        const alert = await Alert.create({
            userId: req.user.id,
            productId,
            targetPrice,
            email
        });
        res.status(201).json(alert);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({ userId: req.user.id }).populate('productId');
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteAlert = async (req, res) => {
    try {
        const alert = await Alert.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }
        res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
