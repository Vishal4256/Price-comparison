const BaseRepository = require('./BaseRepository');
const Wishlist = require('../models/Wishlist');

class WishlistRepository extends BaseRepository {
  constructor() {
    super(Wishlist);
  }
}

module.exports = new WishlistRepository();
