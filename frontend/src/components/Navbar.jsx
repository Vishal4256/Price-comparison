import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0B1E36] rounded text-white flex items-center justify-center font-bold text-lg">
              P
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">PriceWise</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/search?q=electronics" className="text-sm font-medium text-slate-600 hover:text-[#0B1E36] transition-colors">Electronics</Link>
            <Link to="/search?q=appliances" className="text-sm font-medium text-slate-600 hover:text-[#0B1E36] transition-colors">Appliances</Link>
            <Link to="/search?q=fashion" className="text-sm font-medium text-slate-600 hover:text-[#0B1E36] transition-colors">Fashion</Link>
            <Link to="/trending" className="text-sm font-medium text-slate-600 hover:text-[#0B1E36] transition-colors">Daily Deals</Link>
            <Link to="/compare" className="text-sm font-medium text-slate-600 hover:text-[#0B1E36] transition-colors">Compare</Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-6">
            <Link to="/search" className="text-slate-600 hover:text-[#0B1E36] transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            
            {user ? (
              <div className="relative group cursor-pointer">
                <Link to="/dashboard" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#0B1E36] text-white flex items-center justify-center text-sm font-bold">
                    {user.name.charAt(0)}
                  </div>
                </Link>
                {/* Dropdown can go here if needed, but we'll link direct to dashboard */}
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-2 text-sm font-bold text-[#0B1E36] hover:text-slate-600 transition-colors">
                <User className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
