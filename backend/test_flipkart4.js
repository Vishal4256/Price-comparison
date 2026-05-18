const fs = require('fs');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync('flipkart.html'));
const items = $('div[data-id]');
if(items.length > 0) {
    for(let i=0; i<3; i++) {
        const item = $(items[i]);
        const img = item.find('img').first();
        const title = img.attr('alt');
        const link = item.find('a[href*="/p/"]').first().attr('href');
        
        let currentPrice = 0;
        let originalPrice = 0;
        
        const priceTexts = [];
        item.find('*').each(function() {
            const text = $(this).text().trim();
            if(text.startsWith('₹') && !$(this).children().length) {
                priceTexts.push(text);
            }
        });
        
        if (priceTexts.length > 0) {
            currentPrice = parseFloat(priceTexts[0].replace(/[₹,]/g, ''));
            if (priceTexts.length > 1) {
                originalPrice = parseFloat(priceTexts[1].replace(/[₹,]/g, ''));
            } else {
                originalPrice = currentPrice;
            }
        }

        console.log('Title:', title);
        console.log('Price:', currentPrice);
        console.log('Original:', originalPrice);
        console.log('Link:', link);
        console.log('---');
    }
}
