import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { ShieldCheck, BarChart3, Users, Package, Store, Search, TrendingUp, AlertOctagon, Terminal, Activity } from 'lucide-react';

// Import Tabs
import AnalyticsTab from '../components/admin/AnalyticsTab';
import UsersTab from '../components/admin/UsersTab';
import ProductsTab from '../components/admin/ProductsTab';
import RetailersTab from '../components/admin/RetailersTab';
import SearchesTab from '../components/admin/SearchesTab';
import TrendingTab from '../components/admin/TrendingTab';
import ErrorsTab from '../components/admin/ErrorsTab';
import LogsTab from '../components/admin/LogsTab';
import ScraperHealthTab from '../components/admin/ScraperHealthTab';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('analytics');
    
    const user = JSON.parse(localStorage.getItem('user'));

    const tabs = [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'retailers', label: 'Retailers', icon: Store },
        { id: 'searches', label: 'Live Searches', icon: Search },
        { id: 'trending', label: 'Trending', icon: TrendingUp },
        { id: 'health', label: 'Scraper Health', icon: Activity },
        { id: 'errors', label: 'Error Logs', icon: AlertOctagon },
        { id: 'logs', label: 'System Logs', icon: Terminal },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'analytics': return <AnalyticsTab />;
            case 'users': return <UsersTab />;
            case 'products': return <ProductsTab />;
            case 'retailers': return <RetailersTab />;
            case 'searches': return <SearchesTab />;
            case 'trending': return <TrendingTab />;
            case 'health': return <ScraperHealthTab />;
            case 'errors': return <ErrorsTab />;
            case 'logs': return <LogsTab />;
            default: return <AnalyticsTab />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 flex flex-col">
            <Navbar />
            
            {/* Header */}
            <div className="bg-[#0B1E36] text-white pt-16 pb-24 px-4">
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <div className="bg-indigo-500/20 p-4 rounded-3xl border border-indigo-400/30">
                        <ShieldCheck className="w-10 h-10 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black mb-2">Admin Portal</h1>
                        <p className="text-blue-200/60 font-medium">Platform management, analytics, and system health.</p>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl w-full mx-auto px-4 -mt-12 flex-1 flex flex-col lg:flex-row gap-8">
                
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
                        {/* Mobile Dropdown */}
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
