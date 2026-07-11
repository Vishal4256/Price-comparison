const Alert = require('../models/Alert');
const NewsletterSubscription = require('../models/NewsletterSubscription');

exports.subscribeNewsletter = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if already subscribed
        const existing = await NewsletterSubscription.findOne({ email });
        if (existing) {
            if (existing.active) {
                return res.status(400).json({ message: 'This email is already subscribed!' });
            } else {
                existing.active = true;
                await existing.save();
                return res.status(200).json({ message: 'Subscription reactivated successfully!' });
            }
        }

        const subscription = await NewsletterSubscription.create({ email });
        res.status(201).json({ message: 'Successfully subscribed to daily price drop notifications!', subscription });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

exports.updateAlert = async (req, res) => {
    try {
        const { targetPrice, active, emailNotification, browserNotification } = req.body;
        const alert = await Alert.findOne({ _id: req.params.id, userId: req.user.id });
        
        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        if (targetPrice !== undefined) alert.targetPrice = targetPrice;
        if (active !== undefined) alert.active = active;
        if (emailNotification !== undefined) alert.emailNotification = emailNotification;
        if (browserNotification !== undefined) alert.browserNotification = browserNotification;

        await alert.save();
        res.json({ message: 'Alert updated successfully', alert });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
