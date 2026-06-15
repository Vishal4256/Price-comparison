import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Requirement 5: display: flex; justify-content: space-between; align-items: center; */}
        <div className="flex justify-between items-center h-16">
          
          {/* Requirement 3: Logo (PriceWise) */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0B1E36] rounded text-white flex items-center justify-center font-bold text-lg shadow-sm">
              P
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">PriceWise</span>
          </Link>

          {/* Requirement 3: Navigation links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/search?q=electronics" className="text-sm font-medium text-slate-600 hover:text-[#0B1E36] transition-colors">Electronics</Link>
            <Link to="/search?q=appliances" className="text-sm font-medium text-slate-600 hover:text-[#0B1E36] transition-colors">Appliances</Link>
            <Link to="/search?q=fashion" className="text-sm font-medium text-slate-600 hover:text-[#0B1E36] transition-colors">Fashion</Link>
          </div>

          {/* Requirement 3: Search icon/bar & User/Profile icon */}
          <div className="flex items-center gap-6">
            <Link to="/search" className="text-slate-600 hover:text-[#0B1E36] transition-colors" title="Search">
              <Search className="w-5 h-5" />
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-[#0B1E36] transition-colors" title="Dashboard">
                  <LayoutDashboard className="w-5 h-5" />
                </Link>
                <div className="w-8 h-8 rounded-full bg-[#0B1E36] text-white flex items-center justify-center text-sm font-bold shadow-sm" title={user.name}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
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
