import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { User, Heart, Bell, Eye, Search, Sparkles, Tag, Package, Loader2 } from 'lucide-react';

// Import Tabs
import ProfileTab from '../components/dashboard/ProfileTab';
import WishlistTab from '../components/dashboard/WishlistTab';
import AlertsTab from '../components/dashboard/AlertsTab';
import RecentViewsTab from '../components/dashboard/RecentViewsTab';
import RecentSearchesTab from '../components/dashboard/RecentSearchesTab';
import RecommendationsTab from '../components/dashboard/RecommendationsTab';
import CategoriesTab from '../components/dashboard/CategoriesTab';
import OrdersTab from '../components/dashboard/OrdersTab';
import OverviewTab from '../components/dashboard/OverviewTab';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('profile');
    
    // Global Dashboard Data (Fetched once, passed down to tabs)
    const [favorites, setFavorites] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/api/wishlist');
                setFavorites(response.data.data?.items || []);
                // Assuming alerts will be built later, keeping it empty for now
                setAlerts([]);
            } catch (error) {
                console.error("Failed to fetch dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const user = JSON.parse(localStorage.getItem('user'));

    const tabs = [
        { id: 'overview', label: 'Analytics Overview', icon: Sparkles },
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'alerts', label: 'Price Alerts', icon: Bell },
        { id: 'orders', label: 'My Orders', icon: Package },
        { id: 'views', label: 'Recently Viewed', icon: Eye },
        { id: 'searches', label: 'Recent Searches', icon: Search },
        { id: 'recommendations', label: 'For You', icon: Sparkles },
        { id: 'categories', label: 'Favorite Categories', icon: Tag },
    ];

    const renderTabContent = () => {
        if (loading) {
            return (
                <div className="bg-white rounded-3xl border border-slate-200 p-24 flex flex-col items-center justify-center h-[500px]">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                    <h3 className="font-bold text-slate-500">Loading Dashboard...</h3>
                </div>
            );
        }

        switch (activeTab) {
            case 'overview': return <OverviewTab />;
            case 'profile': return <ProfileTab />;
            case 'wishlist': return <WishlistTab favorites={favorites} />;
            case 'alerts': return <AlertsTab alerts={alerts} />;
            case 'views': return <RecentViewsTab />;
            case 'searches': return <RecentSearchesTab />;
            case 'recommendations': return <RecommendationsTab />;
            case 'categories': return <CategoriesTab />;
            case 'orders': return <OrdersTab />;
            default: return <OverviewTab />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 flex flex-col">
                        
            {/* Header */}
            <div className="bg-[#0B1E36] text-white pt-16 pb-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-black mb-2">Command Center</h1>
                    <p className="text-blue-200/60 font-medium">Manage your intelligence tracking, profile, and preferences.</p>
                </div>
            </div>

            <main className="max-w-7xl w-full mx-auto px-4 -mt-12 flex-1 flex flex-col lg:flex-row gap-8">
                
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
                        {/* Mobile Dropdown (Visible only on small screens) */}
                        <div className="block lg:hidden border-b border-slate-100">
                            <select 
                                value={activeTab}
                                onChange={(e) => setActiveTab(e.target.value)}
                                className="w-full p-4 bg-transparent font-bold text-[#0B1E36] focus:outline-none"
                            >
                                {tabs.map(tab => (
                                    <option key={tab.id} value={tab.id}>{tab.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Desktop Sidebar */}
                        <div className="hidden lg:block divide-y divide-slate-50">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-all ${isActive ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'bg-transparent border-l-4 border-transparent hover:bg-slate-50'}`}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                                        <span className={`font-bold ${isActive ? 'text-indigo-900' : 'text-slate-600'}`}>
                                            {tab.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                {/* Content Area */}
                <section className="flex-1 min-w-0">
                    {renderTabContent()}
                </section>
                
            </main>
        </div>
    );
}
