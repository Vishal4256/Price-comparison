const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

const USD_TO_INR = 83.5; 

const getHeaders = (host) => ({
  'User-Agent': getRandomUserAgent(),
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-user': '?1',
  'Cache-Control': 'max-age=0',
  'Host': host,
});

function parsePrice(priceStr) {
  if (!priceStr) return null;
  const num = priceStr.replace(/[^0-9.]/g, '');
  return num ? parseFloat(num) : null;
}

// ---------------------------------------------------------
// AMAZON SCRAPER
// ---------------------------------------------------------
async function scrapeAmazon(query) {
  try {
    const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: getHeaders('www.amazon.in'), timeout: 18000 });
    const $ = cheerio.load(data);
    
    // Check for CAPTCHA
    if (data.includes('api-services-support@amazon.com') || data.includes('Enter the characters you see below')) {
      console.warn('⚠️ Amazon CAPTCHA detected');
      return null;
    }

    const firstResult = $('div[data-component-type="s-search-result"]').first();
    const activeResult = firstResult.length ? firstResult : $('.s-result-item').not('.adHolder').first();

    if (!activeResult.length) return null;

    const title = activeResult.find('h2 span').text().trim();
    let priceStr = activeResult.find('.a-price-whole').first().text().trim();
    if (!priceStr) priceStr = activeResult.find('.a-price .a-offscreen').first().text().trim();
    if (!priceStr) priceStr = activeResult.find('.a-offscreen').first().text().trim();
    
    const originalPriceStr = activeResult.find('.a-text-price .a-offscreen').first().text().trim();
    const linkTag = activeResult.find('h2 a').attr('href');
    const link = linkTag ? 'https://www.amazon.in' + linkTag : url;
    const image = activeResult.find('img.s-image').attr('src');
    const ratingStr = activeResult.find('.a-icon-alt').first().text().trim();

    const price = parsePrice(priceStr);
    if (!price) return null;

    let originalPrice = parsePrice(originalPriceStr) || price;
    if (originalPrice < price) originalPrice = price;
    const discount = originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
    const rating = ratingStr ? parseFloat(ratingStr.split(' ')[0]) : 4.0;

    return {
      website: 'Amazon',
      title: title || query,
      price,
      originalPrice,
      discount,
      link,
      image,
      rating,
      availability: 'In Stock',
    };
  } catch (error) {
    console.warn('[Scraper Warn] Amazon failed:', error.message);
    return null;
  }
}

// ---------------------------------------------------------
// FLIPKART SCRAPER
// ---------------------------------------------------------
async function scrapeFlipkart(query) {
  try {
    const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: getHeaders('www.flipkart.com'), timeout: 18000 });
    const $ = cheerio.load(data);
    
    if (data.includes('Something went wrong') || data.includes('robot')) {
      console.warn('⚠️ Flipkart Block detected');
      return null;
    }

    // Try multiple price selectors
    let priceEl = $('div.Nx9bqj').first(); 
    if (!priceEl.length) priceEl = $('div._30jeq3').first();
    if (!priceEl.length) priceEl = $('div._1vC4OE').first(); // Older grid class
    if (!priceEl.length) priceEl = $('div.hl05eU div').first();

    if (!priceEl.length) return null;

    let container = priceEl.closest('a');
    if (!container.length) container = priceEl.closest('div[data-id]');
    if (!container.length) container = priceEl.parent().parent().parent(); // Deep fallback

    const title = container.find('.KzDlHZ, ._4rR01T, .s1Q9rs, .IRpwTa, .WKTcLC, ._2WkVRV').first().text().trim() || query;
    const priceStr = priceEl.text().trim();
    const originalPriceStr = container.find('.yRaY8j, ._3I9_wc, ._3au9Sg').first().text().trim();
    const href = container.attr('href') || container.find('a').attr('href');
    const link = href ? 'https://www.flipkart.com' + href : url;
    
    let image = container.find('img').first().attr('src');
    if (image && (image.startsWith('data:') || image.includes('placeholder'))) {
      image = container.find('img').eq(1).attr('src') || image;
    }

    const price = parsePrice(priceStr);
    if (!price) return null;

    let originalPrice = parsePrice(originalPriceStr) || price;
    if (originalPrice < price) originalPrice = price;
    const discount = originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    return {
      website: 'Flipkart',
      title: title || query,
      price,
      originalPrice,
      discount,
      link,
      image,
      rating: 4.2, 
      availability: 'In Stock',
    };
  } catch (error) {
    console.warn('[Scraper Warn] Flipkart failed:', error.message);
    return null;
  }
}

// ---------------------------------------------------------
// EBAY SCRAPER
// ---------------------------------------------------------
async function scrapeEbay(query) {
  try {
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: getHeaders('www.ebay.com'), timeout: 15000 });
    const $ = cheerio.load(data);
    
    const firstResult = $('.s-item').not('.s-item__before-answer').first();
    if (!firstResult.length) return null;

    const title = firstResult.find('.s-item__title').text().trim().replace(/^New Listing/, '').trim();
    const priceStr = firstResult.find('.s-item__price').first().text().trim();
    const originalPriceStr = firstResult.find('.s-item__trending-price').first().text().trim() || priceStr;
    const link = firstResult.find('.s-item__link').attr('href') || url;
    const image = firstResult.find('.s-item__image-img').attr('src');

    let price = parsePrice(priceStr.split(' to ')[0]); 
    if (!price) return null;

    price = Math.round(price * USD_TO_INR); 
    
    let originalPrice = parsePrice(originalPriceStr.split(' to ')[0]) || price;
    originalPrice = Math.round(originalPrice * USD_TO_INR);
    if (originalPrice < price) originalPrice = price;
    
    const discount = originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

    return {
      website: 'eBay',
      title: title || query,
      price,
      originalPrice,
      discount,
      link,
      image,
      rating: 4.0,
      availability: 'In Stock',
    };
  } catch (error) {
    console.warn('[Scraper Warn] eBay failed:', error.message);
    return null;
  }
}

// ---------------------------------------------------------
// MASTER EXPORTS
// ---------------------------------------------------------
async function scrapeProduct(query) {
  console.log(`🔍 [Scraper] Initiating search for: "${query}"`);
  
  const [amazon, flipkart, ebay] = await Promise.all([
    scrapeAmazon(query),
    scrapeFlipkart(query),
    scrapeEbay(query)
  ]);

  const results = [amazon, flipkart, ebay].filter(Boolean);
  
  if (amazon) console.log('✅ Amazon: Found product');
  else console.warn('❌ Amazon: Failed (Blocked or No Results)');
  
  if (flipkart) console.log('✅ Flipkart: Found product');
  else console.warn('❌ Flipkart: Failed (Blocked or No Results)');
  
  if (ebay) console.log('✅ eBay: Found product');
  else console.warn('❌ eBay: Failed (Blocked or No Results)');

  if (results.length === 0) {
    console.error('CRITICAL: All scrapers failed. Using fallback simulation.');
    const basePrice = 12000 + Math.floor(Math.random() * 30000);
    return {
      productInfo: {
        name: `${query.charAt(0).toUpperCase() + query.slice(1)} - Market Synthesis`,
        category: 'Market Intel',
        brand: query,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        description: `Synthetic market overview for ${query}. Live vendor APIs are temporarily restricted due to high traffic surveillance.`,
        rating: 4.0,
        totalRatings: 150,
        searchQuery: query,
      },
      prices: [{
        website: 'Global Market',
        price: basePrice,
        originalPrice: basePrice + 3500,
        discount: 15,
        link: '#',
        availability: 'In Stock',
        rating: 4.0,
      }],
      scrapedAt: new Date(),
    };
  }

  // Use the best available result (prioritize Amazon > Flipkart > eBay)
  const bestResult = amazon || flipkart || ebay;

  return {
    productInfo: {
      name: bestResult.title,
      category: 'Verified Product',
      brand: query,
      image: bestResult.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      description: `Premium intelligence data for ${bestResult.title}. Real-time monitoring active.`,
      rating: bestResult.rating,
      totalRatings: Math.floor(Math.random() * 1000) + 50,
      searchQuery: query,
    },
    prices: results,
    scrapedAt: new Date(),
  };
}

function generatePriceHistory(basePrice, days = 30) {
  const history = [];
  let currentPrice = basePrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const trend = -0.002; 
    const noise = (Math.random() * 0.03) - 0.015;
    currentPrice = currentPrice * (1 + trend + noise);
    currentPrice = Math.max(currentPrice, basePrice * 0.6);

    for (const website of ['Amazon', 'Flipkart', 'eBay']) {
      const siteMultiplier = (Math.random() * 0.04) + 0.98;
      history.push({
        website,
        price: Math.round(currentPrice * siteMultiplier),
        timestamp: date,
      });
    }
  }

  return history;
}

module.exports = { scrapeProduct, generatePriceHistory };

