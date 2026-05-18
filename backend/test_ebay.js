const scrape = require('./scrapers/ebayScraper');
scrape('nothing 3').then(console.log).catch(console.error);
