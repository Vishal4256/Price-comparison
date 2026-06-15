const axios = require('axios');
const cheerio = require('cheerio');

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-IN,en;q=0.9',
};

async function test() {
    console.log('=== Amazon Deep Dive ===');
    const r = await axios.get('https://www.amazon.in/s?k=iphone+15', { headers, timeout: 12000 });
    const $ = cheerio.load(r.data);
    
    $('div[data-component-type="s-search-result"]').slice(0,2).each((i, el) => {
        console.log(`\n--- Amazon Item ${i+1} ---`);
        // Title attempts
        console.log('h2 .a-text-normal:', $(el).find('h2 .a-text-normal').text().trim().substring(0,100));
        console.log('h2 a span:', $(el).find('h2 a span').text().trim().substring(0,100));
        console.log('[data-cy="title-recipe"] span:', $(el).find('[data-cy="title-recipe"] span').text().trim().substring(0,100));
        // Link attempts
        const href1 = $(el).find('a.a-link-normal[href*="/dp/"]').first().attr('href');
        const href2 = $(el).find('h2 a').first().attr('href');
        const href3 = $(el).find('a[href*="dp"]').first().attr('href');
        const dataAsin = $(el).attr('data-asin');
        console.log('a.a-link-normal dp href:', href1 ? href1.substring(0,80) : 'NONE');
        console.log('h2 a href:', href2 ? href2.substring(0,80) : 'NONE');
        console.log('a[href*=dp] href:', href3 ? href3.substring(0,80) : 'NONE');
        console.log('data-asin:', dataAsin);
        // Price
        console.log('a-price-whole:', $(el).find('.a-price-whole').first().text().trim());
        console.log('a-offscreen:', $(el).find('.a-offscreen').first().text().trim());
    });

    console.log('\n=== Flipkart Deep Dive ===');
    const r2 = await axios.get('https://www.flipkart.com/search?q=iphone+15', { headers, timeout: 12000 });
    const $f = cheerio.load(r2.data);
    
    $f('div[data-id]').slice(0,2).each((i, el) => {
        console.log(`\n--- Flipkart Item ${i+1} ---`);
        // Title
        const imgAlt = $f(el).find('img').first().attr('alt');
        console.log('img alt:', imgAlt);
        // All divs with class containing price indicators
        const allText = $f(el).text().replace(/\s+/g,' ').trim().substring(0,300);
        console.log('Full text:', allText);
        // Links
        const href = $f(el).find('a[href*="/p/"]').first().attr('href');
        console.log('product link:', href ? href.substring(0,100) : 'NONE');
        // Try finding price via ₹
        const priceText = allText.match(/₹[\d,]+/g);
        console.log('₹ prices found:', priceText);
    });
}

test().catch(console.error);
