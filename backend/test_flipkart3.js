const fs = require('fs');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync('flipkart.html'));
const items = $('div[data-id]');
if(items.length > 0) {
    fs.writeFileSync('flipkart_item.html', $(items[0]).html());
}
