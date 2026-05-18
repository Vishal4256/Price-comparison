import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Menu, X, LogOut, LayoutDashboard, Heart, Bell, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on page navigation
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="w-9 h-9 bg-[#0B1E36] rounded-xl text-white flex items-center justify-center font-bold text-lg shadow-md"
            >
              P
            </motion.div>
            <span className="text-xl font-black text-slate-900 tracking-tight transition-colors group-hover:text-[#0B1E36]">
              PriceWise
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/search?q=electronics" className="text-sm font-semibold text-slate-500 hover:text-[#0B1E36] transition-colors relative py-1">
              Electronics
            </Link>
            <Link to="/search?q=appliances" className="text-sm font-semibold text-slate-500 hover:text-[#0B1E36] transition-colors relative py-1">
              Appliances
            </Link>
            <Link to="/search?q=fashion" className="text-sm font-semibold text-slate-500 hover:text-[#0B1E36] transition-colors relative py-1">
              Fashion
            </Link>
            <Link to="/compare" className="text-sm font-semibold text-slate-500 hover:text-[#0B1E36] transition-colors relative py-1">
              Compare
            </Link>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            
            {/* Search Icon */}
            <Link to="/search" className="p-2 text-slate-500 hover:text-[#0B1E36] hover:bg-slate-50 rounded-xl transition-all">
              <Search className="w-5 h-5" />
            </Link>
            
            {/* Auth Dropdown or Login (Desktop) */}
            <div className="hidden md:block relative" ref={dropdownRef}>
              {user ? (
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#0B1E36] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/80 p-3 flex flex-col gap-1 z-50"
                      >
                        {/* User Profile Info */}
                        <div className="px-3 py-2 border-b border-slate-50 mb-1">
                          <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                          <p className="text-xs font-medium text-slate-400 truncate">{user.email}</p>
                        </div>

                        {/* Navigation Items */}
                        <Link 
                          to="/dashboard" 
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold transition-all"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#0B1E36]" />
                          Dashboard Overview
                        </Link>
                        
                        <Link 
                          to="/dashboard" 
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-bold transition-all"
                        >
                          <Heart className="w-4 h-4 text-[#0B1E36]" />
                          Saved Wishlist
                        </Link>

                        <div className="h-px bg-slate-50 my-1"></div>

                        {/* Logout Trigger */}
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 text-xs font-bold transition-all text-left w-full cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 px-4 py-2 bg-[#0B1E36] hover:bg-[#1a365d] text-white text-xs font-black rounded-xl transition-all shadow-md shadow-slate-200"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-500 hover:text-[#0B1E36] hover:bg-slate-50 rounded-xl transition-all cursor-pointer focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Sidebar Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Drawer Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950 z-40 md:hidden"
            />

            {/* Drawer Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-80 max-w-full bg-white z-50 md:hidden shadow-2xl p-6 flex flex-col gap-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="text-lg font-black text-slate-900">PriceWise Menu</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Segment (Mobile) */}
              {user ? (
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0B1E36] text-white flex items-center justify-center text-base font-bold shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                    <p className="text-[10px] font-medium text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl text-center"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3 bg-[#0B1E36] hover:bg-[#1a365d] text-white font-bold text-xs rounded-xl text-center shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Navigation Links */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-1">Browse Categories</p>
                <Link to="/search?q=electronics" className="px-3 py-3 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 hover:text-[#0B1E36] transition-colors">
                  Electronics
                </Link>
                <Link to="/search?q=appliances" className="px-3 py-3 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 hover:text-[#0B1E36] transition-colors">
                  Appliances
                </Link>
                <Link to="/search?q=fashion" className="px-3 py-3 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 hover:text-[#0B1E36] transition-colors">
                  Fashion
                </Link>
                <Link to="/compare" className="px-3 py-3 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 hover:text-[#0B1E36] transition-colors">
                  Compare Products
                </Link>
              </div>

              {/* Protected Links & Actions (Mobile) */}
              {user && (
                <div className="flex flex-col gap-1.5 mt-auto pt-4 border-t border-slate-100">
                  <Link 
                    to="/dashboard"
                    className="flex items-center gap-3 px-3 py-3 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#0B1E36]" />
                    Dashboard Center
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-3 hover:bg-red-50 rounded-xl text-sm font-bold text-red-500 text-left w-full cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </nav>
  );
}
