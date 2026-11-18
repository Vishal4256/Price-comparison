const UserRepository = require('../repositories/UserRepository');
const WishlistRepository = require('../repositories/WishlistRepository');
const AlertRepository = require('../repositories/AlertRepository');

class DashboardService {
  async getDashboardData(userId) {
    const [user, wishlist, alerts] = await Promise.all([
      UserRepository.findById(userId),
      WishlistRepository.model.find({ user: userId }).populate('product').sort('-createdAt').limit(10),
      AlertRepository.model.find({ user: userId }).populate('product').sort('-createdAt').limit(10)
    ]);

    const wishlistCount = wishlist.length;
    const alertsCount = alerts.length;

    return {
      stats: {
        wishlistCount,
        alertsCount,
        trackedProducts: wishlistCount + alertsCount,
        moneySaved: 0
      },
      wishlist: wishlist || [],
      alerts: alerts || [],
      recentlyViewed: [],
      savedComparisons: [],
      recommendations: [],
      searchHistory: [], 
      trendingDeals: [],
      priceDrops: [],
      account: {
        memberSince: user ? user.createdAt : new Date(),
        name: user ? user.name : 'Unknown',
        email: user ? user.email : 'Unknown'
      }
    };
  }
}

module.exports = new DashboardService();
