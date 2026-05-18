const fs = require('fs');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync('flipkart.html'));
const items = $('div[data-id]');
console.log(`Found ${items.length} items`);
if(items.length > 0) {
    for(let i=0; i<3; i++) {
        console.log($(items[i]).find('div.KzDlHZ').text()); // Title new
        console.log($(items[i]).find('div._4rR01T').text()); // Title old
        console.log($(items[i]).find('div.Nx9bqj').text()); // Price new
        console.log($(items[i]).find('div._30jeq3').text()); // Price old
    }
}
