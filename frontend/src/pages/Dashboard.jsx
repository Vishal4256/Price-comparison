import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import Navbar from '../components/Navbar';
import { 
  LayoutDashboard, Settings, History, Shield, LogOut, 
  Trash2, Edit, Save, Bell, Check, Search, Plus, X,
  Eye, EyeOff, AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [stats, setStats] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [wishlist, setWishlist] = useState({ products: [] });
  const [priceHistory, setPriceHistory] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  
  // Modals and Forms
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [toast, setToast] = useState(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '', email: '', phone: '', profilePicture: '',
    notificationPreferences: { email: true, browser: true }
  });
  
  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };

  const handleLogoutAll = async () => {
    try {
      await api.post('/api/users/logout-all');
      handleLogout();
    } catch (error) {
      showToast('Failed to logout from all devices', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    const pwd = window.prompt("To delete your account, please enter your current password:");
    if (!pwd) return;
    if (window.confirm("Are you absolutely sure you want to delete your account? This cannot be undone.")) {
      try {
        await api.delete('/api/users/account', { data: { currentPassword: pwd } });
        handleLogout();
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to delete account', 'error');
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      await api.post('/api/auth/resend-verification-email');
      showToast('Verification email sent! Please check your inbox.');
    } catch (error) {
      showToast(error.response?.data?.message || 'Error sending verification email', 'error');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [profileRes, alertsRes, wishlistRes, historyRes, searchRes] = await Promise.all([
        api.get('/api/users/profile'),
        api.get('/api/alerts').catch(() => ({ data: [] })),
        api.get('/api/wishlist').catch(() => ({ data: { products: [] } })),
        api.get('/api/users/price-history').catch(() => ({ data: [] })),
        api.get('/api/users/search-history').catch(() => ({ data: [] }))
      ]);

      if (profileRes && profileRes.data) {
        setUser(profileRes.data.user);
        setStats(profileRes.data.dashboard);
        setProfileForm({
          name: profileRes.data.user.name || '',
          email: profileRes.data.user.email || '',
          phone: profileRes.data.user.phone || '',
          profilePicture: profileRes.data.user.profilePicture || '',
          notificationPreferences: profileRes.data.user.notificationPreferences || { email: true, browser: true }
        });
      }
      setAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : (alertsRes.data.alerts || []));
      setWishlist(wishlistRes.data || { products: [] });
      setPriceHistory(historyRes.data || []);
      setSearchHistory(searchRes.data || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [token, navigate]);

  const handleDeleteAlert = async (id) => {
    try {
      await api.delete(`/api/alerts/${id}`);
      setAlerts(alerts.filter(a => a._id !== id));
      showToast('Alert deleted successfully');
    } catch (error) {
      showToast('Error deleting alert', 'error');
    }
  };

  const handleRemoveWishlist = async (productId) => {
    try {
      await api.delete(`/api/wishlist/remove/${productId}`);
      setWishlist({
        ...wishlist,
        products: wishlist.products.filter(p => p._id !== productId)
      });
      showToast('Removed from saved products');
    } catch (error) {
      showToast('Error removing product', 'error');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/api/users/profile', profileForm);
      setUser(res.data.user);
      showToast('Profile updated successfully');
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating profile', 'error');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        return showToast('Image must be less than 1MB', 'error');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showToast('New passwords do not match', 'error');
    }
    try {
      await api.put('/api/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      showToast('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showToast(error.response?.data?.message || 'Error changing password', 'error');
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      await api.delete(`/api/users/price-history/${id}`);
      setPriceHistory(priceHistory.filter(h => h._id !== id));
      showToast('History record deleted');
    } catch (error) {
      showToast('Failed to delete history', 'error');
    }
  };

  const handleDeleteSearchHistory = async (id) => {
    try {
      await api.delete(`/api/users/search-history/${id}`);
      setSearchHistory(searchHistory.filter(h => h._id !== id));
      showToast('Search history record deleted');
    } catch (error) {
      showToast('Failed to delete search history', 'error');
    }
  };

  const handleClearSearchHistory = async () => {
    if (window.confirm("Are you sure you want to clear your entire search history?")) {
      try {
        await api.delete('/api/users/search-history');
        setSearchHistory([]);
        showToast('Search history cleared');
      } catch (error) {
        showToast('Failed to clear search history', 'error');
      }
    }
  };

  const renderOverview = () => (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1E36] mb-1">Welcome back, {user.name}</h1>
          <p className="text-slate-500 text-sm">Here's your tracking overview.</p>
        </div>
        <button onClick={() => { setEditingAlert(null); setIsAlertModalOpen(true); }} className="hidden sm:block px-4 py-2 bg-[#0B1E36] text-white font-bold text-sm rounded-lg hover:bg-[#1a365d] transition-colors cursor-pointer">
          + Create New Alert
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Alerts', value: stats.activeAlertsCount || 0 },
          { label: 'Saved Products', value: stats.savedProductsCount || 0 },
          { label: 'Total Money Saved', value: `₹${(stats.totalMoneySaved || 0).toLocaleString('en-IN')}` },
          { label: 'Last Search', value: stats.lastSearch || 'None' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <p className="text-xl font-bold text-[#0B1E36] mt-1 truncate" title={stat.value}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Active Price Alerts */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8 shadow-sm">
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
              {alerts.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">You have no active price alerts.</td></tr>
              ) : (
                alerts.map((alert) => {
                  const product = alert.productId;
                  if (!product) return null;
                  const isHit = (product.currentPrice || product.price) <= alert.targetPrice;
                  
                  return (
                    <tr key={alert._id} className="border-b border-gray-55 hover:bg-slate-50 transition-colors">
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
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => { setEditingAlert(alert); setIsAlertModalOpen(true); }} className="text-blue-400 hover:text-blue-600 font-medium text-xs cursor-pointer">
                          <Edit className="w-4 h-4 inline-block" />
                        </button>
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
          {wishlist.products.length === 0 ? (
            <div className="col-span-3 bg-white rounded-2xl border border-gray-200 p-8 text-center text-slate-500 shadow-sm">
              You have not saved any products yet.
            </div>
          ) : (
            wishlist.products.map((product) => (
              <div key={product._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 shadow-sm transition-all flex flex-col group">
                <div className="h-40 bg-gray-50 p-4 flex items-center justify-center relative shrink-0">
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
  );

  const renderSettings = () => (
    <div className="animate-fadeIn bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#0B1E36] mb-6">My Settings</h2>
      <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" value={profileForm.name} 
              onChange={e => setProfileForm({...profileForm, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1E36] focus:border-transparent" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" value={profileForm.email} 
              readOnly
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-slate-500 cursor-not-allowed" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input 
              type="tel" value={profileForm.phone} 
              onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1E36] focus:border-transparent" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center border border-slate-300">
                {profileForm.profilePicture ? (
                  <img src={profileForm.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl text-slate-500 font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <input 
                  type="file" accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0B1E36] file:text-white hover:file:bg-[#1a365d] cursor-pointer"
                />
                <p className="text-xs text-slate-400 mt-1">Max size: 1MB</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={profileForm.notificationPreferences.email} 
                onChange={e => setProfileForm({
                  ...profileForm, 
                  notificationPreferences: { ...profileForm.notificationPreferences, email: e.target.checked }
                })}
                className="w-4 h-4 text-[#0B1E36] rounded focus:ring-[#0B1E36]" 
              />
              <span className="text-sm text-slate-700">Email Notifications for Price Drops</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={profileForm.notificationPreferences.browser} 
                onChange={e => setProfileForm({
                  ...profileForm, 
                  notificationPreferences: { ...profileForm.notificationPreferences, browser: e.target.checked }
                })}
                className="w-4 h-4 text-[#0B1E36] rounded focus:ring-[#0B1E36]" 
              />
              <span className="text-sm text-slate-700">Browser Notifications for Price Drops</span>
            </label>
          </div>
        </div>

        <button type="submit" className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0B1E36] text-white font-bold rounded-xl hover:bg-[#1a365d] transition-colors cursor-pointer shadow-sm">
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </form>
    </div>
  );

  const renderHistory = () => (
    <div className="animate-fadeIn space-y-8">
      {/* Search History */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-900">Search History</h2>
          {searchHistory.length > 0 && (
            <button onClick={handleClearSearchHistory} className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
              Clear All
            </button>
          )}
        </div>
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-white border-b border-gray-100 sticky top-0">
              <tr>
                <th className="px-6 py-3 font-medium">Keyword</th>
                <th className="px-6 py-3 font-medium">Results Found</th>
                <th className="px-6 py-3 font-medium">Date & Time</th>
                <th className="px-6 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {searchHistory.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Your search history is empty.</td></tr>
              ) : (
                searchHistory.map((history) => (
                  <tr key={history._id} className="border-b border-gray-55 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{history.query}</td>
                    <td className="px-6 py-4 text-slate-500">{history.resultsFound}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(history.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteSearchHistory(history._id)} className="text-red-400 hover:text-red-600 font-medium text-xs cursor-pointer">
                        <Trash2 className="w-4 h-4 inline-block" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price History */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-900">Price History Logs</h2>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-white border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 font-medium">Retailer</th>
              <th className="px-6 py-3 font-medium">Price Recorded</th>
              <th className="px-6 py-3 font-medium">Date & Time</th>
              <th className="px-6 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {priceHistory.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No price history available for tracked items.</td></tr>
            ) : (
              priceHistory.map((history) => {
                const product = history.productId;
                if (!product) return null;
                return (
                  <tr key={history._id} className="border-b border-gray-55 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 max-w-[200px] truncate" title={product.title}>{product.title || 'Unknown'}</td>
                    <td className="px-6 py-4 text-slate-500">{product.source || 'Unknown'}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{(history.price || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(history.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDeleteHistory(history._id)} className="text-red-400 hover:text-red-600 font-medium text-xs cursor-pointer">
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
    </div>
  );

  const renderSecurity = () => (
    <div className="animate-fadeIn space-y-8">
      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#0B1E36] mb-6">Profile & Security</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Account Created</p>
            <p className="font-medium text-slate-900">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Last Login</p>
            <p className="font-medium text-slate-900">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</p>
          </div>
          {/* Removing Email Verification Section per user request */}
        </div>

        {/* Change Password */}
        <h3 className="text-sm font-bold text-slate-900 mb-4 border-t border-gray-200 pt-6">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
            <input 
              type="password" required value={passwordForm.currentPassword} 
              onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1E36] focus:border-transparent" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <input 
              type="password" required value={passwordForm.newPassword} minLength={6}
              onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1E36] focus:border-transparent" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
            <input 
              type="password" required value={passwordForm.confirmPassword} minLength={6}
              onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1E36] focus:border-transparent" 
            />
          </div>
          <button type="submit" className="px-6 py-2.5 bg-[#0B1E36] text-white font-bold rounded-xl hover:bg-[#1a365d] transition-colors cursor-pointer shadow-sm w-full">
            Update Password
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-2xl border border-red-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-red-900 mb-4">Danger Zone</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={handleLogoutAll} className="px-6 py-2.5 bg-white border border-red-300 text-red-700 font-bold rounded-xl hover:bg-red-100 transition-colors cursor-pointer shadow-sm">
            Logout All Devices
          </button>
          <button onClick={handleDeleteAccount} className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors cursor-pointer shadow-sm">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      
      {toast && (
        <div className={`fixed top-24 right-4 z-50 px-6 py-3 rounded-lg shadow-lg font-medium text-sm animate-fadeIn ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sticky top-24 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 px-4">Account Center</h3>
            <nav className="flex flex-col gap-1">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${activeTab === 'overview' ? 'bg-[#0B1E36] text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <LayoutDashboard className="w-4 h-4" /> Overview
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${activeTab === 'settings' ? 'bg-[#0B1E36] text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <Settings className="w-4 h-4" /> My Settings
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${activeTab === 'history' ? 'bg-[#0B1E36] text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <History className="w-4 h-4" /> Price History
              </button>
              <button 
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${activeTab === 'security' ? 'bg-[#0B1E36] text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                <Shield className="w-4 h-4" /> Profile & Security
              </button>
              <div className="h-px bg-gray-200 my-2 mx-4"></div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-medium text-sm transition-colors w-full text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-[#0B1E36] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'settings' && renderSettings()}
              {activeTab === 'history' && renderHistory()}
              {activeTab === 'security' && renderSecurity()}
            </>
          )}
        </div>
      </div>
      
      {/* Alert Modal */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-[#0B1E36]">{editingAlert ? 'Edit Price Alert' : 'Create New Alert'}</h3>
              <button onClick={() => { setIsAlertModalOpen(false); setEditingAlert(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (editingAlert) {
                  const res = await api.put(`/api/alerts/${editingAlert._id}`, {
                    targetPrice: editingAlert.targetPrice,
                    active: editingAlert.active,
                    emailNotification: editingAlert.emailNotification,
                    browserNotification: editingAlert.browserNotification
                  });
                  setAlerts(alerts.map(a => a._id === editingAlert._id ? res.data.alert : a));
                  showToast('Alert updated successfully');
                }
                setIsAlertModalOpen(false);
                setEditingAlert(null);
              } catch (error) {
                showToast('Error updating alert', 'error');
              }
            }} className="p-6 space-y-4">
              
              {editingAlert && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Price (₹)</label>
                    <input 
                      type="number" required value={editingAlert.targetPrice} 
                      onChange={e => setEditingAlert({...editingAlert, targetPrice: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B1E36]" 
                    />
                  </div>
                  
                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer mb-2">
                      <input 
                        type="checkbox" checked={editingAlert.active} 
                        onChange={e => setEditingAlert({...editingAlert, active: e.target.checked})}
                        className="w-4 h-4 text-[#0B1E36] rounded" 
                      />
                      <span className="text-sm text-slate-700">Alert Active</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer mb-2">
                      <input 
                        type="checkbox" checked={editingAlert.emailNotification ?? true} 
                        onChange={e => setEditingAlert({...editingAlert, emailNotification: e.target.checked})}
                        className="w-4 h-4 text-[#0B1E36] rounded" 
                      />
                      <span className="text-sm text-slate-700">Email Notification</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" checked={editingAlert.browserNotification ?? true} 
                        onChange={e => setEditingAlert({...editingAlert, browserNotification: e.target.checked})}
                        className="w-4 h-4 text-[#0B1E36] rounded" 
                      />
                      <span className="text-sm text-slate-700">Browser Notification</span>
                    </label>
                  </div>
                </>
              )}

              {!editingAlert && (
                 <div className="text-center py-4">
                   <p className="text-sm text-slate-500 mb-4">To create a new alert, search for a product on the home page and click "Track Price".</p>
                   <Link to="/" className="px-6 py-2.5 bg-[#0B1E36] text-white font-bold rounded-xl inline-block cursor-pointer">
                     Go to Search
                   </Link>
                 </div>
              )}

              {editingAlert && (
                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button type="button" onClick={() => { setIsAlertModalOpen(false); setEditingAlert(null); }} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-[#0B1E36] text-white font-bold rounded-lg hover:bg-[#1a365d]">Save Changes</button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
