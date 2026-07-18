const axios = require('axios');

exports.extractIntent = async (query) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not defined in environment variables.');
        }

        const prompt = `
        You are a highly intelligent shopping assistant.
        Analyze the following user search query and extract the key shopping parameters.
        Respond ONLY with a valid JSON object matching this exact schema:
        {
            "category": "string (the general product category, e.g. laptop, smartphone, shoes)",
            "budget": "number (the maximum price extracted, or null if none specified)",
            "brand": "string (the brand name if mentioned, or null)",
            "keywords": "string (the core search terms, e.g. 'gaming laptop', 'running shoes')",
            "intent": "string (either 'buy', 'research', or 'gift')"
        }
        
        Query: "${query}"
        `;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1, // Keep it deterministic
                    responseMimeType: "application/json"
                }
            }
        );

        const textResponse = response.data.candidates[0].content.parts[0].text;
        
        // Parse the JSON strictly
        const parsed = JSON.parse(textResponse);
        return parsed;
        
    } catch (error) {
        console.error('Gemini API Error:', error.response?.data || error.message);
        
        // Fallback gracefully if Gemini fails or rate limits
        return {
            category: null,
            budget: null,
            brand: null,
            keywords: query, // Just use the raw query as the fallback keyword
            intent: 'buy'
        };
    }
};

exports.compareProducts = async (productA, productB) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY is missing.');

        const prompt = `
        You are an expert tech reviewer conducting a hardcore head-to-head comparison between two products:
        Product A: "${productA}"
        Product B: "${productB}"

        Evaluate both products strictly across these 9 categories:
        Camera, Battery, Performance, Gaming, Display, Charging, Build Quality, Software, Value.

        You MUST respond with a STRICT JSON object in this exact schema. Do not include markdown code blocks, just raw JSON.
        {
            "winner": "string (The exact name of the winning product)",
            "reasoning": "string (A 2-3 sentence summary of why the winner won overall)",
            "categories": [
                {
                    "name": "Camera",
                    "productA": "string (Short description of Product A's camera)",
                    "productB": "string (Short description of Product B's camera)",
                    "winner": "string (Either 'productA', 'productB', or 'tie')"
                },
                // ... repeat for all 9 categories
            ]
        }
        `;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.2, // Low temp for structured, factual JSON
                    responseMimeType: "application/json"
                }
            }
        );

        let textResponse = response.data.candidates[0].content.parts[0].text;
        
        return JSON.parse(textResponse);
        
    } catch (error) {
        console.error('Gemini Compare Error:', error.response?.data || error.message);
        throw new Error('Failed to generate AI comparison.');
    }
};
