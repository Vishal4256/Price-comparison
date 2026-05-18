const fs = require('fs');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync('flipkart.html'));
const items = $('div[data-id]');
if(items.length > 0) {
    for(let i=0; i<3; i++) {
        const titleEl = $(items[i]).find('div[class*="KzDlHZ"], div[class*="4rR01T"], a[title], div.s1Q9rs, a.IRpwTa, a.wjcEIp, div.yKfJKb');
        const priceEl = $(items[i]).find('div[class*="Nx9bqj"], div[class*="30jeq3"]');
        const originalPriceEl = $(items[i]).find('div[class*="yRaY8j"], div[class*="3I9_ca"]');
        console.log('Title:', titleEl.text().trim() || titleEl.attr('title'));
        console.log('Price:', priceEl.text().trim());
        console.log('Original:', originalPriceEl.text().trim());
        console.log('Link:', $(items[i]).find('a').attr('href'));
        console.log('---');
    }
}
