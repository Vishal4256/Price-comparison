import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, Bell, Heart, User } from 'lucide-react';
import { useTheme } from "../context/ThemeContext";
import SearchBar from "../components/search/SearchBar";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">PriceSmart</span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-2xl px-8">
            <SearchBar />
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={toggleTheme} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/alerts" className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell className="w-5 h-5" />
            </Link>
            <Link to="/wishlist" className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Heart className="w-5 h-5" />
            </Link>
            <Link to="/dashboard" className="flex items-center space-x-2 pl-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border border-gray-300 dark:border-gray-600">
                <User className="w-4 h-4 text-gray-500 dark:text-gray-300" />
              </div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="px-4 pt-4 pb-6 space-y-4">
            <SearchBar />
            <div className="flex justify-around pt-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={toggleTheme} className="flex flex-col items-center p-2 text-gray-500 dark:text-gray-400">
                {theme === 'dark' ? <Sun className="w-6 h-6 mb-1" /> : <Moon className="w-6 h-6 mb-1" />}
                <span className="text-xs">Theme</span>
              </button>
              <Link to="/alerts" className="flex flex-col items-center p-2 text-gray-500 dark:text-gray-400">
                <Bell className="w-6 h-6 mb-1" />
                <span className="text-xs">Alerts</span>
              </Link>
              <Link to="/wishlist" className="flex flex-col items-center p-2 text-gray-500 dark:text-gray-400">
                <Heart className="w-6 h-6 mb-1" />
                <span className="text-xs">Wishlist</span>
              </Link>
              <Link to="/dashboard" className="flex flex-col items-center p-2 text-gray-500 dark:text-gray-400">
                <User className="w-6 h-6 mb-1" />
                <span className="text-xs">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
