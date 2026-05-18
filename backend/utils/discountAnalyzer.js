const analyzeDiscount = (history, currentPrice, originalPrice) => {
    if (history.length < 3) return { isFake: false, reason: "Not enough history" };

    const prices = history.map(h => h.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    
    // Check if price was increased significantly before "sale"
    const lastPrice = history[history.length - 1].price;
    const previousPrice = history.length > 1 ? history[history.length - 2].price : lastPrice;

    if (currentPrice > previousPrice && originalPrice > currentPrice) {
        return { 
            isFake: true, 
            reason: `Price increased from ₹${previousPrice} to ₹${currentPrice} before setting an original price of ₹${originalPrice}.` 
        };
    }

    if (currentPrice > minPrice * 1.1 && originalPrice > currentPrice) {
        return {
            isFake: true,
            reason: `Current price ₹${currentPrice} is 10% higher than historical low ₹${minPrice}.`
        };
    }

    return { isFake: false, reason: "Discount seems legitimate" };
};

module.exports = { analyzeDiscount };
