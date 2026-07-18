// Dummy database for now (will be replaced by actual scraping/MongoDB lookups)
exports.getProductDetails = async (req, res) => {
    try {
        // Mock factual product data
        const productData = {
            success: true,
            timestamp: new Date().toISOString(),
            product: {
                id: req.params.id,
                title: "Mock Apple MacBook Air M2",
                brand: "Apple",
                category: "Laptops",
                description: "Supercharged by M2, the MacBook Air features a gorgeous Liquid Retina display.",
                gallery: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8"],
                specifications: { "RAM": "8GB", "Storage": "256GB SSD", "Processor": "M2" },
                rating: 4.8,
                reviews: 1245,
                aiSummary: "This product is highly rated for its premium build quality and excellent battery life. Users frequently praise the seamless integration, though some note it is slightly heavier than previous models."
            },
            pricing: {
                offers: [
                    { retailer: "Amazon", price: 95000, shipping: 0, url: "#" },
                    { retailer: "Flipkart", price: 94000, shipping: 200, url: "#" }
                ],
                lowestPrice: 94200,
                highestPrice: 95000,
                averagePrice: 94600,
                coupons: [{ retailer: "Amazon", code: "HDFC10", discount: 1000 }],
                cashback: [],
                lastUpdated: new Date().toISOString()
            },
            metadata: {
                availableRetailers: 2,
                priceHistoryAvailable: true,
                aiAvailable: true,
                cacheStatus: "miss"
            }
        };

        if (res) {
            return res.status(200).json(productData);
        }
        return productData; // For internal calls
    } catch (error) {
        console.error('Error fetching product details:', error);
        if (res) {
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    }
};

// Async endpoint specifically for the AI Analysis section so we don't block the page load
exports.getProductAnalysis = async (req, res) => {
    try {
        // In reality, this would query Gemini with the factual product data
        
        // Simulating AI generation delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const aiAnalysis = {
            success: true,
            analysis: {
                summary: "The M2 MacBook Air represents the best overall laptop for most users, offering exceptional battery life, silent operation, and powerful performance.",
                pros: ["Exceptional battery life", "Silent (no fan)", "Great display", "Lightweight"],
                cons: ["Only 2 USB-C ports", "Base model SSD is slightly slower", "Not for heavy gaming"],
                whoShouldBuy: "Students, professionals, and general users looking for a reliable, fast, and portable machine.",
                whoShouldAvoid: "Hardcore gamers or professionals requiring intensive 3D rendering (consider MacBook Pro).",
                alternatives: [
                    { id: "alt-1", title: "Dell XPS 13" },
                    { id: "alt-2", title: "MacBook Pro M2" }
                ],
                recommendation: "Strong Buy - especially at the Flipkart price with the HDFC discount."
            }
        };

        res.status(200).json(aiAnalysis);
    } catch (error) {
        console.error('Error fetching AI analysis:', error);
        res.status(500).json({ success: false, message: 'Failed to generate AI analysis' });
    }
};
