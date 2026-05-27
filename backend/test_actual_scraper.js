const scrapeActualUrl = require('./scrapers/actualUrlScraper');

const runTests = async () => {
    console.log('🏁 Starting Exact-URL Scraper Tests...\n');

    // 1. Test Amazon
    const amazonUrl = 'https://www.amazon.in/Sony-WH-1000XM5-Wireless-Cancelling-Headphones/dp/B0B3C57Z5V';
    console.log('1. Testing Amazon Scraping...');
    const amazonResult = await scrapeActualUrl(amazonUrl, 'Amazon');
    console.log('Amazon Test Result:', amazonResult ? JSON.stringify(amazonResult, null, 2) : '❌ FAILED');
    console.log('\n----------------------------------------\n');

    // 2. Test Flipkart
    const flipkartUrl = 'https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm2d83c2c288554';
    console.log('2. Testing Flipkart Scraping...');
    const flipkartResult = await scrapeActualUrl(flipkartUrl, 'Flipkart');
    console.log('Flipkart Test Result:', flipkartResult ? JSON.stringify(flipkartResult, null, 2) : '❌ FAILED');
    console.log('\n----------------------------------------\n');

    // 3. Test eBay
    const ebayUrl = 'https://www.ebay.com/itm/335292359419';
    console.log('3. Testing eBay Scraping...');
    const ebayResult = await scrapeActualUrl(ebayUrl, 'eBay');
    console.log('eBay Test Result:', ebayResult ? JSON.stringify(ebayResult, null, 2) : '❌ FAILED');
    console.log('\n----------------------------------------\n');

    console.log('🏁 Tests completed.');
    process.exit(0);
};

runTests();
