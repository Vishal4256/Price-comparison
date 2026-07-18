const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.use(protect); // All wishlist routes require authentication

router.route('/')
    .get(wishlistController.getWishlist)
    .post(wishlistController.addItem);

router.route('/:itemId')
    .put(wishlistController.updateItem)
    .delete(wishlistController.removeItem);

module.exports = router;
