const UserRepository = require('../repositories/UserRepository');
const WishlistRepository = require('../repositories/WishlistRepository');
const AlertRepository = require('../repositories/AlertRepository');

class DashboardService {
  async getDashboardData(userId) {
    const [user, wishlistCount, alertsCount] = await Promise.all([
      UserRepository.findById(userId),
      WishlistRepository.count({ user: userId }),
      AlertRepository.count({ user: userId })
    ]);

    return {
      stats: {
        wishlistCount,
        alertsCount,
        trackedProducts: wishlistCount + alertsCount,
        moneySaved: 0 // Mock calculation, to be implemented when transactions exist
      },
      wishlist: [], // Fetch real data when products exist
      alerts: [],
      recentlyViewed: [],
      savedComparisons: [],
      recommendations: [],
      searchHistory: [], // Fetch real history
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
