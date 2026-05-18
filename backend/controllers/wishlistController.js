const Wishlist = require('../models/Wishlist');

exports.getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ userId: req.user.id }).populate('products');
        if (!wishlist) {
            wishlist = await Wishlist.create({ userId: req.user.id, products: [] });
        }
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        let wishlist = await Wishlist.findOne({ userId: req.user.id });
        
        if (!wishlist) {
            wishlist = await Wishlist.create({ userId: req.user.id, products: [productId] });
        } else {
            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId);
                await wishlist.save();
            }
        }
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        let wishlist = await Wishlist.findOne({ userId: req.user.id });
        
        if (wishlist) {
            wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
            await wishlist.save();
        }
        res.json({ message: 'Removed from wishlist successfully', wishlist });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
