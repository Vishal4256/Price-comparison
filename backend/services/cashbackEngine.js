class CashbackEngine {
    
    // In a real app, fetches credit card/wallet offers from a provider API.
    async getCashbackOffers(productId, retailer) {
        const mockOffers = [
            {
                provider: 'HDFC Bank Credit Card',
                type: 'percentage',
                value: 5,
                maxCap: 1500,
                retailer: 'Amazon'
            },
            {
                provider: 'ICICI Amazon Pay',
                type: 'percentage',
                value: 5,
                maxCap: Infinity,
                retailer: 'Amazon'
            },
            {
                provider: 'Axis Bank Flipkart Card',
                type: 'percentage',
                value: 5,
                maxCap: Infinity,
                retailer: 'Flipkart'
            }
        ];

        return mockOffers.filter(o => o.retailer.toLowerCase() === retailer.toLowerCase());
    }

    calculateEffectivePrice(currentPrice, coupons, cashbacks) {
        let price = currentPrice;
        let totalDiscount = 0;

        // 1. Apply best coupon first
        if (coupons && coupons.length > 0) {
            const bestCoupon = coupons[0]; // Assuming pre-sorted by CouponEngine
            if (price >= bestCoupon.minimumOrder) {
                let discount = bestCoupon.discountType === 'percentage' 
                    ? price * (bestCoupon.discountValue / 100)
                    : bestCoupon.discountValue;
                price -= discount;
                totalDiscount += discount;
            }
        }

        // 2. Apply best cashback on the discounted price
        let bestCashbackValue = 0;
        if (cashbacks && cashbacks.length > 0) {
            for (const cb of cashbacks) {
                let cbValue = cb.type === 'percentage'
                    ? price * (cb.value / 100)
                    : cb.value;
                
                if (cbValue > cb.maxCap) cbValue = cb.maxCap;
                if (cbValue > bestCashbackValue) bestCashbackValue = cbValue;
            }
            price -= bestCashbackValue;
            totalDiscount += bestCashbackValue;
        }

        return {
            effectivePrice: Math.max(0, price),
            totalSavings: totalDiscount
        };
    }
}

module.exports = new CashbackEngine();
