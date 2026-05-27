import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { api } from '../api';
import Navbar from '../components/Navbar';
import { LayoutDashboard, Settings, History, Shield, LogOut, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' };
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  
  const [alerts, setAlerts] = useState([]);
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(true);

  // Clear local storage and redirect to login
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [alertsRes, wishlistRes] = await Promise.all([
        api.get('/api/alerts', { headers }),
        api.get('/api/wishlist', { headers })
      ]);
      
      setAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : (alertsRes.data.alerts || []));
      setWishlist(wishlistRes.data || { products: [] });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        // Automatically sign out and redirect on expired/invalid session
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login?redirect=%2Fdashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await api.delete(`/api/alerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(alerts.filter(a => a._id !== id));
    } catch (error) {
      console.error('Error deleting alert:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleRemoveWishlist = async (productId) => {
    try {
      await api.delete(`/api/wishlist/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist({
        ...wishlist,
        products: wishlist.products.filter(p => p._id !== productId)
      });
    } catch (error) {
      console.error('Error removing wishlist item:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sticky top-24">
            <h3 className="text-sm font-bold text-slate-900 mb-4 px-4">Account Center</h3>
            <nav className="flex flex-col gap-1">
              <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0B1E36] text-white font-medium text-sm">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard Overview
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition-colors">
                <Settings className="w-4 h-4" />
                My Settings
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition-colors">
                <History className="w-4 h-4" />
                Price History
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition-colors">
                <Shield className="w-4 h-4" />
                Profile & Security
              </a>
              <div className="h-px bg-gray-200 my-2 mx-4"></div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium text-sm transition-colors w-full text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </nav>

            <div className="mt-8 p-4 bg-[#0B1E36] rounded-xl text-white">
              <h4 className="font-bold text-sm mb-1">PriceWise Pro</h4>
              <p className="text-xs text-blue-200 mb-3">Get unlimited price tracking and faster alerts.</p>
              <button className="w-full py-2 bg-[#D4AF37] hover:bg-[#c49e29] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#0B1E36] mb-1">Welcome back, {user.name}</h1>
              <p className="text-slate-500 text-sm">Here's what's happening with your tracked items today.</p>
            </div>
            <button className="hidden sm:block px-4 py-2 bg-[#0B1E36] text-white font-bold text-sm rounded-lg hover:bg-[#1a365d] transition-colors cursor-pointer">
              + Create New Alert
            </button>
          </div>

          {/* Active Price Alerts */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-900">Active Price Alerts ({alerts.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-white border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 font-medium">Target Price</th>
                    <th className="px-6 py-3 font-medium">Current Price</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="px-6 py-4 text-center text-slate-500">Loading alerts...</td></tr>
                  ) : alerts.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">You have no active price alerts.</td></tr>
                  ) : (
                    alerts.map((alert) => {
                      const product = alert.productId;
                      if (!product) return null;
                      const isHit = (product.currentPrice || product.price) <= alert.targetPrice;
                      
                      return (
                        <tr key={alert._id} className="border-b border-gray-55 hover:bg-slate-50">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center p-1">
                              <img src={product.image || 'https://via.placeholder.com/100'} alt={product.title || product.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <span className="font-medium text-slate-900 max-w-[200px] truncate" title={product.title || product.name}>{product.title || product.name || 'Unknown'}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">₹{alert.targetPrice.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">₹{(product.currentPrice || product.price || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                          <td className="px-6 py-4">
                            {isHit ? (
                              <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">Price Hit!</span>
                            ) : (
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">Tracking</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDeleteAlert(alert._id)} className="text-red-400 hover:text-red-600 font-medium text-xs cursor-pointer">
                              <Trash2 className="w-4 h-4 inline-block" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Saved Products */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-900">Saved Products ({wishlist.products.length})</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-3 text-center py-8 text-slate-500">Loading saved products...</div>
              ) : wishlist.products.length === 0 ? (
                <div className="col-span-3 bg-white rounded-2xl border border-gray-200 p-8 text-center text-slate-500">
                  You have not saved any products yet.
                </div>
              ) : (
                wishlist.products.map((product) => (
                  <div key={product._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors flex flex-col">
                    <div className="h-40 bg-gray-50 p-4 flex items-center justify-center relative group shrink-0">
                      <img src={product.image || 'https://via.placeholder.com/300'} alt={product.title || product.name} className="max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                      <button onClick={() => handleRemoveWishlist(product._id)} className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-50 cursor-pointer">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="font-bold text-slate-900 text-sm mb-1 truncate" title={product.title || product.name}>{product.title || product.name || 'Unknown'}</h3>
                      <div className="flex items-center justify-between mb-3 mt-auto">
                        <span className="font-bold text-[#0B1E36] text-lg">₹{(product.currentPrice || product.price || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                      </div>
                      <Link to={`/product/${product._id}`} className="w-full py-2 bg-[#0B1E36] text-white font-bold text-xs rounded-lg hover:bg-[#1a365d] transition-colors text-center inline-block cursor-pointer">
                        View Options
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
