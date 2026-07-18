class CouponEngine {
    
    // In a real app, this would fetch from a 3rd party API or scrape dedicated coupon sites.
    // We simulate the normalization of coupons here.
    async getCouponsForProduct(productId, retailer) {
        // Mock coupon database based on retailer
        const mockCoupons = [
            {
                code: 'SAVE10',
                description: 'Extra 10% off on all electronics',
                discountType: 'percentage',
                discountValue: 10,
                minimumOrder: 5000,
                expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                retailer: 'Amazon'
            },
            {
                code: 'FLAT500',
                description: 'Flat ₹500 off on select items',
                discountType: 'fixed',
                discountValue: 500,
                minimumOrder: 2000,
                expiry: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                retailer: 'Flipkart'
            }
        ];

        // Filter and normalize
        const validCoupons = mockCoupons
            .filter(c => c.retailer.toLowerCase() === retailer.toLowerCase())
            .filter(c => c.expiry > new Date());

        // Sort by best value (heuristic: percentage usually better for expensive items)
        return validCoupons.sort((a, b) => {
            if (a.discountType === 'percentage' && b.discountType === 'fixed') return -1;
            return 0;
        });
    }

    calculateBestCouponSavings(currentPrice, coupons) {
        let bestSavings = 0;
        let bestCoupon = null;

        for (const coupon of coupons) {
            if (currentPrice >= coupon.minimumOrder) {
                let savings = 0;
                if (coupon.discountType === 'percentage') {
                    savings = currentPrice * (coupon.discountValue / 100);
                } else if (coupon.discountType === 'fixed') {
                    savings = coupon.discountValue;
                }

                if (savings > bestSavings) {
                    bestSavings = savings;
                    bestCoupon = coupon;
                }
            }
        }

        return { bestSavings, bestCoupon };
    }
}

module.exports = new CouponEngine();
