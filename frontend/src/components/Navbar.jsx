import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Search, ShoppingBag, Camera, Heart } from 'lucide-react';
import NotificationBell from './notifications/NotificationBell';
import VisionModal from './vision/VisionModal';

export default function Navbar({ isAuthenticated, setIsAuthenticated }) {
    const navigate = useNavigate();
    const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-[#0B1E36] p-1.5 rounded-lg group-hover:scale-105 transition-transform">
                        <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-black text-[#0B1E36] tracking-tight">PriceWise</span>
                    <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full ml-1 hidden sm:inline-block">v2.0</span>
                </Link>

                {/* Right Side Actions */}
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsVisionModalOpen(true)}
                        className="text-slate-500 hover:text-indigo-600 transition-colors p-2 hidden sm:block"
                        title="Visual Search"
                    >
                        <Camera className="w-5 h-5" />
                    </button>
                    <Link to="/search" className="text-slate-500 hover:text-[#0B1E36] transition-colors p-2">
                        <Search className="w-5 h-5" />
                    </Link>

                    <VisionModal isOpen={isVisionModalOpen} onClose={() => setIsVisionModalOpen(false)} />

                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <NotificationBell />
                            <Link to="/wishlist" className="text-slate-500 hover:text-rose-500 transition-colors p-2" title="My Wishlist">
                                <Heart className="w-5 h-5" />
                            </Link>
                            <Link to="/dashboard" className="text-sm font-bold text-slate-600 hover:text-[#0B1E36] transition-colors hidden sm:block">
                                Dashboard
                            </Link>
                            <Link to="/profile" className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-[#0B1E36] hover:bg-slate-200 transition-colors" title="My Profile">
                                <User className="w-4 h-4" />
                            </Link>
                            <button 
                                onClick={handleLogout}
                                className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="text-sm font-bold text-[#0B1E36] hover:text-blue-700 transition-colors">
                                Log in
                            </Link>
                            <Link to="/register" className="text-sm font-bold bg-[#0B1E36] text-white px-4 py-2 rounded-lg hover:bg-[#1a365d] transition-colors shadow-sm">
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
