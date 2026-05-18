const fs = require('fs');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync('ebay.html'));
const items = $('li.s-item');
console.log(`Found ${items.length} items`);
if(items.length > 1) {
    const item = $(items[1]);
    const title = item.find('.s-item__title').text();
    const price = item.find('.s-item__price').text();
    const link = item.find('a.s-item__link').attr('href');
    const image = item.find('img').attr('src');
    console.log('Title:', title);
    console.log('Price:', price);
    console.log('Link:', link);
    console.log('Image:', image);
}
