require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../utils/logger');
const connectDB = require('../config/db');

// Models
const Category = require('../models/Category');
const Retailer = require('../models/Retailer');

const categories = [
  { name: 'Electronics', icon: 'smartphone', slug: 'electronics' },
  { name: 'Smartphones', icon: 'smartphone', slug: 'smartphones', parentId: null }, // Assuming flat structure for now
  { name: 'Laptops', icon: 'laptop', slug: 'laptops' },
  { name: 'Audio', icon: 'headphones', slug: 'audio' },
  { name: 'Wearables', icon: 'watch', slug: 'wearables' },
  { name: 'Home Appliances', icon: 'home', slug: 'home-appliances' }
];

const retailers = [
  { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', url: 'https://amazon.in' },
  { name: 'Flipkart', logo: 'https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg', url: 'https://flipkart.com' },
  { name: 'Croma', logo: 'https://d2d22nphq0yz8t.cloudfront.net/88e6cc4b-eaa1-4053-af65-563d88ba8b26/https://www.croma.com/assets/images/croma_logo_dark.png/mxw_2048,f_auto', url: 'https://croma.com' },
  { name: 'Reliance Digital', logo: 'https://www.reliancedigital.in/build/client/images/loaders/rd_logo_c.svg', url: 'https://reliancedigital.in' },
  { name: 'Vijay Sales', logo: 'https://www.vijaysales.com/images/logo.png', url: 'https://vijaysales.com' }
];

const seed = async () => {
  try {
    await connectDB();
    logger.info('Connected to MongoDB. Starting seed process...');

    // Clear existing minimal seed data
    await Category.deleteMany({});
    await Retailer.deleteMany({});
    logger.info('Cleared existing Categories and Retailers');

    // Insert new data
    await Category.insertMany(categories);
    await Retailer.insertMany(retailers);
    
    logger.info('Seeded Categories and Retailers successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during seeding:', error);
    process.exit(1);
  }
};

seed();
