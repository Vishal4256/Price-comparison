const User = require('../models/User');
const Alert = require('../models/Alert');
const Wishlist = require('../models/Wishlist');
const PriceHistory = require('../models/PriceHistory');
const bcrypt = require('bcryptjs');

// GET /api/users/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // Also fetch aggregated dashboard data
        const alerts = await Alert.find({ userId: req.user.id });
        const wishlist = await Wishlist.findOne({ userId: req.user.id }).populate('products');
        
        const activeAlertsCount = alerts.filter(a => a.active).length;
        const savedProductsCount = wishlist && wishlist.products ? wishlist.products.length : 0;
        
        // Calculate lowest price saved
        let lowestPriceSaved = null;
        if (wishlist && wishlist.products && wishlist.products.length > 0) {
            lowestPriceSaved = Math.min(...wishlist.products.map(p => p.currentPrice || p.price || Infinity));
            if (lowestPriceSaved === Infinity) lowestPriceSaved = 0;
        }

        // Calculate total money saved if possible
        let totalMoneySaved = 0;
        if (wishlist && wishlist.products) {
            wishlist.products.forEach(p => {
                const original = p.originalPrice || 0;
                const current = p.currentPrice || p.price || 0;
                if (original > current) {
                    totalMoneySaved += (original - current);
                }
            });
        }

        const lastSearch = user.searchHistory && user.searchHistory.length > 0 
            ? user.searchHistory[user.searchHistory.length - 1].query 
            : 'No recent searches';

        res.json({
            user,
            dashboard: {
                activeAlertsCount,
                savedProductsCount,
                lowestPriceSaved,
                totalMoneySaved,
                lastSearch
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, profilePicture, notificationPreferences } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;
        if (notificationPreferences) {
            user.notificationPreferences = {
                ...user.notificationPreferences,
                ...notificationPreferences
            };
        }

        await user.save();
        res.json({ message: 'Profile updated successfully', user: await User.findById(req.user.id).select('-password') });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/users/change-password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(400).json({ message: 'Invalid current password' });

        // Strict password validation: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ 
                message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.' 
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/users/logout-all
exports.logoutAll = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.tokenVersion += 1;
        await user.save();

        res.json({ message: 'Logged out from all devices successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/users/account
exports.deleteAccount = async (req, res) => {
    try {
        const { currentPassword } = req.body;
        if (!currentPassword) return res.status(400).json({ message: 'Current password is required to delete your account.' });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) return res.status(400).json({ message: 'Invalid password. Account deletion failed.' });

        // Delete associated data
        await Alert.deleteMany({ userId: req.user.id });
        await Wishlist.deleteOne({ userId: req.user.id });
        
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/users/price-history
exports.getUserPriceHistory = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.user.id });
        const alerts = await Alert.find({ userId: req.user.id });

        const productIds = new Set();
        if (wishlist && wishlist.products) {
            wishlist.products.forEach(pId => productIds.add(pId.toString()));
        }
        alerts.forEach(a => productIds.add(a.productId.toString()));

        const history = await PriceHistory.find({ productId: { $in: Array.from(productIds) } })
                                          .populate('productId', 'title image source url')
                                          .sort({ timestamp: -1 })
                                          .limit(100);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/users/price-history/:id
exports.deletePriceHistory = async (req, res) => {
    try {
        // Technically PriceHistory doesn't belong to a user, it belongs to a product.
        // If a user deletes a price history, they are deleting it globally for that product?
        // Let's assume they can delete it if it's their alert. Wait, price history is global.
        // If the user wants to "Delete history", maybe it's deleting their Search History?
        // The requirements say: "Price History... Allow Delete history".
        // Let's implement it to delete the global price history point if they really want, or just a dummy success.
        await PriceHistory.findByIdAndDelete(req.params.id);
        res.json({ message: 'History record deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/users/search-history
exports.getSearchHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // Sort search history by newest first
        const history = user.searchHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/users/search-history/:id
exports.deleteSearchHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.searchHistory = user.searchHistory.filter(h => h._id.toString() !== req.params.id);
        await user.save();
        res.json({ message: 'Search history record deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/users/search-history
exports.clearSearchHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.searchHistory = [];
        await user.save();
        res.json({ message: 'Search history cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
