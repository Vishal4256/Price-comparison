const axios = require('axios');
const geminiService = require('../services/geminiService');
const scraperService = require('../services/scraperService');
const aiDecisionEngine = require('../services/aiDecisionEngine');

exports.chat = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        console.log(`[AI Assistant] Received message: "${message}"`);

        // Step 1: Extract intent
        const intent = await geminiService.extractIntent(message);
        
        let products = [];
        let finalResponseText = '';

        if (intent.category || intent.keywords !== message) {
            console.log(`[AI Assistant] Product intent detected. Fetching live data for:`, intent.keywords);
            
            // Step 2 & 3 & 4: Fetch live data from Retailer Engine / Registry
            const allProducts = await scraperService.searchAllRetailers(intent);
            products = allProducts.slice(0, 3);
            
            // Step 5: Price Intelligence (implicit in search ranking now)
            
            // Step 6: AI Decision Engine
            finalResponseText = await aiDecisionEngine.chatWithAssistant(message, products);
        } else {
            console.log(`[AI Assistant] General conversation detected.`);
            finalResponseText = await aiDecisionEngine.chatWithAssistant(message, []);
        }

        res.status(200).json({
            success: true,
            text: finalResponseText,
            products: products,
            ai: { available: true, model: "Gemini", generatedAt: new Date().toISOString() }
        });

    } catch (error) {
        console.error('[AI Assistant] Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred while communicating with the AI Assistant.',
            ai: { available: false }
        });
    }
};
