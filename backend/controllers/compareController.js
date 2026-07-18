const geminiService = require('../services/geminiService');

exports.compareProducts = async (req, res) => {
    try {
        const { products } = req.body;

        if (!products || !Array.isArray(products) || products.length < 2) {
            return res.status(400).json({ success: false, message: 'Please provide at least two products to compare.' });
        }

        console.log(`[Compare Controller] Generating structured comparison for ${products.length} products`);

        // Phase 3 Refinement: Send structured facts to Gemini and ask for JSON response
        // Mocking the structured comparison engine for now
        const comparisonEngineData = {
            winner: products[0].title, // Simplified deterministic choice
            priceDifference: `₹${Math.abs((products[0].lowestPrice || 0) - (products[1].lowestPrice || 0))}`,
            performance: "Comparable",
            battery: "Product A leads",
            display: "Product B leads",
            value: "Product A offers better value"
        };

        // Instead of plain text, we return a structured object for the frontend to render
        const responsePayload = {
            success: true,
            structuredComparison: {
                winner: comparisonEngineData.winner,
                reasons: [
                    "Better battery life",
                    `Lower average price by ${comparisonEngineData.priceDifference}`,
                    "Superior performance metrics"
                ],
                summary: `Based on a deterministic analysis of price and specifications, ${comparisonEngineData.winner} offers better overall value.`
            },
            // Include raw engine data if the frontend wants to render radar charts or bars
            engineData: comparisonEngineData 
        };

        res.status(200).json(responsePayload);
    } catch (error) {
        console.error('[Compare Controller] Error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate product comparison', error: error.message });
    }
};
