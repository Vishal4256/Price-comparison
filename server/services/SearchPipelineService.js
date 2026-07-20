const logger = require('../utils/logger');
const geminiClassifier = require('../classifiers/GeminiClassifier');
const retailerRegistry = require('../scrapers/RetailerRegistry');
const productMatchingService = require('./ProductMatchingService');
const rankingService = require('./RankingService');
const cacheManager = require('../cache/CacheManager');
const searchAnalyticsService = require('./SearchAnalyticsService');

// AI Services
const aiDealExplanationService = require('./ai/AIDealExplanationService');
const aiProductSummaryService = require('./ai/AIProductSummaryService');
const geminiRecommendation = require('./recommendations/GeminiRecommendation');

// Require normalizers
const AmazonNormalizer = require('../scrapers/amazon/AmazonNormalizer');
const FlipkartNormalizer = require('../scrapers/flipkart/FlipkartNormalizer');

class SearchPipelineService {
  /**
   * Execute the end-to-end universal search pipeline.
   * @param {string} query 
   * @param {Object} context (e.g. userId)
   */
  async execute(query, context = {}) {
    const startTime = Date.now();
    let cacheHit = false;
    let finalResults = [];

    // 1. Intent Classification (Gemini + Rule-based fallback)
    const intent = await geminiClassifier.classify(query, context);

    // 2. Cache Check (Bypass scrape if cache is fresh)
    let cachedData = null;
    if (!context.forceBypassCache) {
      cachedData = await cacheManager.get(intent.normalizedQuery);
    }
    
    if (cachedData && cachedData.length > 0) {
      cacheHit = true;
      // In a real scenario, we might want to re-run matching or ranking on cached data 
      // if context changes (e.g. personalized ranking).
      finalResults = cachedData.map(c => this.mapProductToDTO(c));
    } else {
      // 3. Retailer Selection
      const scrapers = retailerRegistry.getRelevantScrapers(intent, context);
      const retailersUsed = scrapers.map(s => s.retailerId);

      // 4. Parallel Scraping
      const scrapePromises = scrapers.map(scraper => 
        scraper.search(intent.normalizedQuery, { limit: 5 })
          .then(raw => ({ retailerId: scraper.retailerId, raw, status: 'fulfilled' }))
          .catch(err => {
            logger.error(`Scraper failed for ${scraper.retailerId}:`, err.message);
            return { retailerId: scraper.retailerId, raw: [], status: 'rejected', error: err.message };
          })
      );

      const results = await Promise.allSettled(scrapePromises);
      
      // 5. Normalization
      let allNormalizedProducts = [];
      for (const res of results) {
        if (res.status === 'fulfilled' && res.value.status === 'fulfilled') {
          const { retailerId, raw } = res.value;
          
          let normalized = [];
          if (retailerId === 'amazon') {
            normalized = raw.map(r => AmazonNormalizer.normalize(r));
          } else if (retailerId === 'flipkart') {
            normalized = raw.map(r => FlipkartNormalizer.normalize(r));
          }
          
          allNormalizedProducts = allNormalizedProducts.concat(normalized.filter(n => n !== null));
        }
      }

      // 6. Product Matching
      const matchedGroups = productMatchingService.match(allNormalizedProducts);

      // 7. Caching (Async)
      cacheManager.set(intent.normalizedQuery, matchedGroups).catch(e => logger.error('Cache set error:', e));

      // 8. Ranking
      const rankedGroups = rankingService.rank(matchedGroups, intent);

      finalResults = rankedGroups;
    }

    // 9. AI Enrichment for Top Results (Max 3)
    const buyDecisionService = require('./prediction/BuyDecisionService');
    const similarityEngine = require('./prediction/SimilarityEngine');
    const explainableAiService = require('./intelligence/ExplainableAIService');

    const enrichedResults = await Promise.all(
      finalResults.slice(0, 3).map(async (result) => {
        // A. Buy Decision & Prediction
        const buyDecision = await buyDecisionService.evaluate(result, intent);
        result.buyDecision = buyDecision;

        // B. Grounded AI Explanation
        if (result.priceIntelligence) {
          const evidence = {
            currentPrice: result.lowestPrice,
            average30Day: result.priceIntelligence.average30Days || result.lowestPrice,
            lowestPrice30Day: result.priceIntelligence.lowest30Days || result.lowestPrice,
            prediction: buyDecision.prediction ? buyDecision.prediction.prediction : 'Stable',
            dealScore: result.dealScore ? result.dealScore.score : 0
          };
          
          if (!result.dealScore) result.dealScore = { score: 0 };
          
          result.dealScore.explanation = await explainableAiService.generateExplanation(
            evidence, 
            buyDecision.recommendation
          );
        }
        
        // C. AI Product Summary
        const baseIdentity = {
          canonicalId: result.id,
          brand: result.brand,
          model: result.model,
          category: intent.category,
          lowestPrice: result.lowestPrice
        };
        result.aiSummary = await aiProductSummaryService.getSummary(baseIdentity);

        // D. Alternatives
        result.alternatives = await similarityEngine.findAlternatives(baseIdentity, finalResults.map(g => ({
           id: g.id,
           brand: g.brand,
           category: intent.category,
           lowestPrice: g.lowestPrice,
           title: g.title
        })), 3);

        return result;
      })
    );

    // Replace the first 3 items with their enriched versions
    for (let i = 0; i < enrichedResults.length; i++) {
      finalResults[i] = enrichedResults[i];
    }

    // 10. AI Recommendations (Contextual/Personalized)
    let aiRecommendations = [];
    if (context.userId) {
      const personalizedRecommendationService = require('./recommendations/PersonalizedRecommendationService');
      aiRecommendations = await personalizedRecommendationService.getPersonalizedFeed(context.userId, 5);
    } else {
      aiRecommendations = await geminiRecommendation.getRecommendations(intent, context);
    }

    const latencyMs = Date.now() - startTime;

    // 11. Search Analytics (Async)
    if (!context.isSystemRefresh) {
      searchAnalyticsService.recordSearch({
        query: intent.originalQuery,
        userId: context.userId,
        resultsCount: finalResults.length,
        intent: intent.category,
        retailersUsed: intent.suggestedRetailers,
        latencyMs,
        cacheHit
      });
    }

    return {
      query: intent.originalQuery,
      intent: intent.category,
      results: finalResults,
      recommendations: aiRecommendations,
      meta: { latencyMs, cacheHit }
    };
  }

  mapProductToDTO(cachedProduct) {
    // Convert Mongo cached product to standard output format
    return {
      groupId: cachedProduct._id || cachedProduct.id,
      title: cachedProduct.name,
      brand: cachedProduct.brand,
      lowestPrice: cachedProduct.basePrice,
      imageUrl: cachedProduct.imageUrl,
      offers: [] // In a fully fleshed out MongoCache, we would store sub-offers array.
    };
  }
}

module.exports = new SearchPipelineService();
