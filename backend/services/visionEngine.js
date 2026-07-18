const axios = require('axios');
const logger = require('../utils/logger');

class VisionEngine {
    constructor() {
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
    }

    async extractFromImage(buffer, mimeType) {
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

            const prompt = `
                You are an expert product identifier for an e-commerce price comparison engine.
                Analyze this image and identify the exact product being shown.
                Return ONLY a strict JSON object with the following schema, and NO Markdown formatting (no \`\`\`json):
                {
                  "query": "string (the exact product name and model to use for a text search)",
                  "brand": "string",
                  "category": "string",
                  "attributes": {
                    "color": "string",
                    "storage": "string",
                    "other": "string"
                  },
                  "confidence": "number between 0 and 1 representing your certainty"
                }
            `;

            const base64Data = buffer.toString('base64');

            const payload = {
                contents: [{
                    parts: [
                        { text: prompt },
                        { 
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Data
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1, // Keep it deterministic
                    responseMimeType: "application/json" // Force JSON output
                }
            };

            const response = await axios.post(`${this.apiUrl}?key=${apiKey}`, payload);
            const rawText = response.data.candidates[0].content.parts[0].text;
            
            return this.normalizeVisionResult(rawText);

        } catch (error) {
            logger.error(`VisionEngine Image Error: ${error.message}`);
            throw new Error("Failed to process image through Vision API");
        }
    }

    async extractFromBarcode(barcode) {
        // Without an internal UPC database, we'll format it as a standardized query.
        // In a real app, this would query a third-party UPC lookup API first.
        return {
            barcode: barcode,
            type: "EAN/UPC",
            query: barcode, // The registry scrapers (like Amazon) will interpret a barcode query directly
            confidence: 1.0
        };
    }

    normalizeVisionResult(rawJsonText) {
        try {
            // Strip any accidental markdown just in case responseMimeType fails
            let cleanText = rawJsonText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanText);
            
            return this.validateVisionResponse(parsed);
        } catch (error) {
            logger.error(`Failed to normalize vision result: ${rawJsonText}`);
            throw new Error("Vision model returned malformed output");
        }
    }

    validateVisionResponse(data) {
        // Ensure required fields exist
        if (!data.query || typeof data.query !== 'string') {
            data.query = "Unknown Product";
        }
        if (typeof data.confidence !== 'number') {
            data.confidence = 0.5;
        }

        return {
            query: data.query,
            brand: data.brand || 'Unknown',
            category: data.category || 'Unknown',
            attributes: data.attributes || {},
            confidence: data.confidence,
            barcode: null
        };
    }
}

module.exports = new VisionEngine();
