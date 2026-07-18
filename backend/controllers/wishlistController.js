const Wishlist = require('../models/Wishlist');
const cacheUtils = require('../utils/cacheUtils');

exports.getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            wishlist = await Wishlist.create({ user: req.user._id, items: [] });
        }
        res.status(200).json({ success: true, count: wishlist.items.length, data: wishlist });
    } catch (error) {
        console.error('Error in getWishlist:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch wishlist' });
    }
};

exports.addItem = async (req, res) => {
    try {
        const { productId, title, image, retailer, productUrl, currentPrice, currency, targetPrice, notifyOnDrop } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'productId is required' });
        }

        let wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user._id, items: [] });
        }

        // Check if item already exists
        const existingItemIndex = wishlist.items.findIndex(item => item.productId === productId);
        
        if (existingItemIndex > -1) {
            // Update existing item
            wishlist.items[existingItemIndex].currentPrice = currentPrice || wishlist.items[existingItemIndex].currentPrice;
            if (targetPrice !== undefined) wishlist.items[existingItemIndex].targetPrice = targetPrice;
            if (notifyOnDrop !== undefined) wishlist.items[existingItemIndex].notifyOnDrop = notifyOnDrop;
        } else {
            // Add new item
            wishlist.items.push({
                productId, title, image, retailer, productUrl, currentPrice, currency, targetPrice, notifyOnDrop
            });
        }

        await wishlist.save();
        cacheUtils.invalidateUserFeed(req.user._id);
        res.status(201).json({ success: true, message: 'Item added to wishlist', data: wishlist });
    } catch (error) {
        console.error('Error in addItem:', error);
        res.status(500).json({ success: false, message: 'Failed to add item to wishlist' });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { targetPrice, notifyOnDrop } = req.body;

        const wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }

        const item = wishlist.items.id(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found in wishlist' });
        }

        if (targetPrice !== undefined) item.targetPrice = targetPrice;
        if (notifyOnDrop !== undefined) item.notifyOnDrop = notifyOnDrop;

        await wishlist.save();
        res.status(200).json({ success: true, message: 'Item updated successfully', data: wishlist });
    } catch (error) {
        console.error('Error in updateItem:', error);
        res.status(500).json({ success: false, message: 'Failed to update wishlist item' });
    }
};

exports.removeItem = async (req, res) => {
    try {
        const { itemId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }

        wishlist.items.pull({ _id: itemId });
        await wishlist.save();
        cacheUtils.invalidateUserFeed(req.user._id);

        res.status(200).json({ success: true, message: 'Item removed successfully', data: wishlist });
    } catch (error) {
        console.error('Error in removeItem:', error);
        res.status(500).json({ success: false, message: 'Failed to remove item from wishlist' });
    }
};
