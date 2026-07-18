const axios = require('axios');
const priceIntelligence = require('./priceIntelligence');

class AIDecisionEngine {
    constructor() {
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    }

    async _callGemini(prompt) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

        const response = await axios.post(`${this.apiUrl}?key=${apiKey}`, {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json"
            }
        });
        
        return JSON.parse(response.data.candidates[0].content.parts[0].text);
    }

    async getDealScore(productId, currentPrice, productTitle) {
        // 1. Fetch Deterministic Math
        const stats = await priceIntelligence.getPriceSummary(productId);
        
        let scoreValue = 50;
        let rating = "Fair";
        let factors = { priceVsAverage: 0, priceVsLowest: 0, trend: "stable", volatility: "low" };

        if (stats && currentPrice) {
            const avg = stats.average || currentPrice;
            const lowest = stats.lowest || currentPrice;
            
            factors.priceVsAverage = Number((((avg - currentPrice) / avg) * 100).toFixed(1));
            factors.priceVsLowest = Number((((currentPrice - lowest) / lowest) * 100).toFixed(1));
            factors.trend = stats.trend?.trend || "stable";
            factors.volatility = stats.volatility > 5 ? "high" : "low";

            // Base score 50. Reward being below average, penalize being above.
            scoreValue = Math.min(100, Math.max(0, 50 + (factors.priceVsAverage * 2) - (factors.priceVsLowest * 0.5)));
            scoreValue = Math.floor(scoreValue);

            if (scoreValue >= 80) rating = "Excellent";
            else if (scoreValue >= 60) rating = "Good";
            else if (scoreValue >= 40) rating = "Fair";
            else rating = "Poor";
        }

        const deterministicData = {
            score: {
                value: scoreValue,
                rating,
                factors
            },
            explanation: { summary: "AI explanation unavailable", confidence: 0 }
        };

        // 2. Build AI Prompt
        const prompt = `
            You are a deal analyst. Analyze the following deterministic pricing facts for "${productTitle || productId}".
            Current Price: ${currentPrice}
            Average Price: ${stats?.average}
            Lowest Ever: ${stats?.lowest}
            Trend: ${factors.trend}
            
            Provide a JSON response explaining this deal:
            {
                "summary": "string (A 2-sentence explanation of why this is a ${rating} deal)",
                "confidence": "number (0-100)"
            }
        `;

        try {
            const aiResponse = await this._callGemini(prompt);
            return {
                success: true,
                data: {
                    score: deterministicData.score,
                    explanation: aiResponse
                },
                ai: { available: true, model: "Gemini", generatedAt: new Date().toISOString() }
            };
        } catch (error) {
            console.error("AI Deal Score failed, falling back to deterministic data.", error.message);
            return {
                success: true,
                data: deterministicData,
                ai: { available: false }
            };
        }
    }

    async getRecommendation(productId, currentPrice, productTitle) {
        const stats = await priceIntelligence.getPriceSummary(productId);
        
        let decision = "WAIT";
        let signals = [];

        if (stats && currentPrice) {
            const trend = stats.trend?.trend;
            
            if (trend === "falling" && currentPrice <= (stats.average || currentPrice)) {
                decision = "BUY NOW";
                signals.push("Prices are currently falling.");
                signals.push("Current price is below the historical average.");
            } else if (trend === "rising") {
                decision = "WAIT";
                signals.push("Prices are currently trending upwards.");
            } else if (currentPrice > (stats.average || currentPrice)) {
                decision = "WAIT";
                signals.push("Price is higher than the historical average.");
            } else {
                decision = "WATCH";
                signals.push("Price is stable and average.");
            }
        }

        const deterministicData = {
            decision,
            confidence: decision === "WATCH" ? 50 : 85,
            signals,
            explanation: { summary: "AI explanation unavailable" }
        };

        const prompt = `
            You are a shopping advisor for "${productTitle || productId}".
            Based on the following deterministic rules, we decided to recommend: ${decision}.
            Signals: ${JSON.stringify(signals)}
            
            Provide a JSON response explaining this recommendation:
            {
                "summary": "string (A 2-sentence explanation advising the user)"
            }
        `;

        try {
            const aiResponse = await this._callGemini(prompt);
            deterministicData.explanation = aiResponse;
            return {
                success: true,
                data: deterministicData,
                ai: { available: true, model: "Gemini", generatedAt: new Date().toISOString() }
            };
        } catch (error) {
            console.error("AI Recommendation failed, falling back to deterministic data.");
            return {
                success: true,
                data: deterministicData,
                ai: { available: false }
            };
        }
    }

    async detectFakeDiscount(productId, currentPrice, advertisedMrp, productTitle) {
        const stats = await priceIntelligence.getPriceSummary(productId);
        
        const historicalAverage = stats?.average || currentPrice;
        const advertisedDiscount = advertisedMrp ? (((advertisedMrp - currentPrice) / advertisedMrp) * 100) : 0;
        const actualHistoricalDiscount = (((historicalAverage - currentPrice) / historicalAverage) * 100);

        // Deterministic threshold: If advertised discount is > 20% higher than the actual historical average discount, flag it.
        let isSuspicious = false;
        let confidence = 0;

        if (advertisedMrp && advertisedMrp > (historicalAverage * 1.5)) {
            isSuspicious = true;
            confidence = 90;
        } else if ((advertisedDiscount - actualHistoricalDiscount) > 20) {
            isSuspicious = true;
            confidence = 85;
        }

        const deterministicData = {
            isSuspicious,
            confidence,
            advertisedDiscount: Number(advertisedDiscount.toFixed(1)),
            actualHistoricalDiscount: Number(actualHistoricalDiscount.toFixed(1)),
            historicalAverage,
            currentPrice,
            advertisedMrp,
            explanation: { summary: "AI explanation unavailable" }
        };

        const prompt = `
            You are a consumer protection AI. Analyze this pricing for "${productTitle || productId}".
            Advertised MRP: ${advertisedMrp}
            Current Price: ${currentPrice}
            Historical Average: ${historicalAverage}
            Suspicious Flag: ${isSuspicious}
            
            Provide a JSON response:
            {
                "summary": "string (A 1-2 sentence explanation of whether this discount is genuine or inflated)"
            }
        `;

        try {
            const aiResponse = await this._callGemini(prompt);
            deterministicData.explanation = aiResponse;
            return {
                success: true,
                data: deterministicData,
                ai: { available: true, model: "Gemini", generatedAt: new Date().toISOString() }
            };
        } catch (error) {
            console.error("AI Fake Discount Detection failed, falling back.");
            return {
                success: true,
                data: deterministicData,
                ai: { available: false }
            };
        }
    }
    async chatWithAssistant(message, products) {
        let prompt = '';
        if (products && products.length > 0) {
            prompt = `
                You are the PriceWise AI Shopping Assistant. 
                The user asked: "${message}"
                
                I have searched our retailer engine and found these real-time products:
                ${JSON.stringify(products.map(p => ({ title: p.title, price: p.price, retailer: p.retailer })))}
                
                Write a concise, helpful, and friendly response. Recommend these specific products. Mention their prices and retailers. Do NOT act like a generic chatbot. Be an expert shopping assistant. Keep it under 4 sentences.
            `;
        } else {
            prompt = `
                You are the PriceWise AI Shopping Assistant. 
                The user said: "${message}"
                
                Respond helpfully and concisely. Remind them you can find the lowest prices across Amazon, Flipkart, Myntra, and more.
            `;
        }

        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

            const response = await axios.post(`${this.apiUrl}?key=${apiKey}`, {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7 } // Higher temp for chat
            });
            
            return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
            const status = error.response?.status;
            const isQuotaExhausted = status === 429 || 
                error.response?.data?.error?.status === 'RESOURCE_EXHAUSTED';

            if (isQuotaExhausted) {
                console.warn("[AI Assistant] Gemini quota exhausted (429).");
                return "The AI assistant is temporarily unavailable because the current Gemini API quota has been reached. Core PriceWise features such as Search, Price Comparison, Wishlist, and Dashboard continue to work normally. Please try again later.";
            }

            console.error("AI Assistant Chat failed.", error.message);
            return "I'm having trouble connecting to the AI engine right now. Please try again in a moment.";
        }
    }
    async summarizeUserDashboard(metrics) {
        const prompt = `
            You are the PriceWise AI Shopping Assistant analyzing a user's dashboard.
            Here is the deterministic data:
            Total Wishlist Items: ${metrics.totalWishlistItems}
            Below Target Price: ${metrics.belowTargetCount}
            Total Savings Potential: ₹${metrics.totalSavingsPotential}
            Average Deal Score: ${metrics.averageDealScore}
            Tracked Products: ${metrics.trackedProducts}
            Favorite Categories: ${JSON.stringify(metrics.favoriteCategories)}

            Write a 3-sentence summary highlighting their savings potential, their most tracked category, and an encouraging closing remark.
        `;

        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

            const response = await axios.post(`${this.apiUrl}?key=${apiKey}`, {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.3 }
            });
            
            return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("AI Analytics Summary failed.", error.message);
            return `You currently have ₹${metrics.totalSavingsPotential.toLocaleString()} in potential savings across ${metrics.trackedProducts} tracked products!`;
        }
    }
    async summarizeNotification(eventData) {
        const prompt = `
            You are the PriceWise AI Shopping Assistant. 
            Write a single, highly engaging, and concise sentence summarizing this event for a push notification:
            Event Type: ${eventData.type}
            Product: ${eventData.title}
            Current Price: ₹${eventData.currentPrice}
            Previous Price: ₹${eventData.previousPrice}
            Retailer: ${eventData.retailer}
            Reason: ${eventData.triggerReason}
        `;

        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

            const response = await axios.post(`${this.apiUrl}?key=${apiKey}`, {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.3 }
            });
            
            return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("AI Notification Summary failed.", error.message);
            return null; // Let the caller fallback to default
        }
    }
}

module.exports = new AIDecisionEngine();
