import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">PriceSmart</span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
              AI-powered price intelligence. Compare prices across top retailers and never overpay again.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/search" className="text-base text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Search</Link></li>
              <li><Link to="/categories" className="text-base text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Categories</Link></li>
              <li><Link to="/deals" className="text-base text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Featured Deals</Link></li>
              <li><Link to="/alerts" className="text-base text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Price Alerts</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-base text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="text-base text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="text-base text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Contact</Link></li>
              <li><Link to="/careers" className="text-base text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-base text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-base text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-base text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
          
        </div>
        
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {new Date().getFullYear()} PriceSmart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
