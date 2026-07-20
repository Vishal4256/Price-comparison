import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';
import { Package, Bell, TrendingDown, Clock } from 'lucide-react';
import axios from 'axios';

// Independent Widget: Personal Feed
const PersonalFeedWidget = () => {
  const [feed, setFeed] = useState(null);
  useEffect(() => {
    // Mock fetch
    setTimeout(() => {
      setFeed([
        { title: 'iPhone 15 Pro', reason: 'Based on your recent search', price: 134900, deal: 'Good Deal' },
        { title: 'Sony WH-1000XM5', reason: 'Lowest price in 30 days', price: 26990, deal: 'Buy Now' }
      ]);
    }, 800);
  }, []);

  if (!feed) return <div className="h-32 bg-neutral-800/50 animate-pulse rounded-xl"></div>;

  return (
    <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
      <h3 className="text-lg font-bold text-neutral-100 mb-4 flex items-center gap-2">
        <Package size={20} className="text-primary-400" /> Recommended For You
      </h3>
      <div className="space-y-4">
        {feed.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 bg-neutral-900 rounded-lg">
            <div>
              <p className="font-semibold text-neutral-200">{item.title}</p>
              <p className="text-xs text-neutral-400">{item.reason}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-400">₹{item.price}</p>
              <p className="text-xs text-primary-400">{item.deal}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Independent Widget: Active Alerts
const ActiveAlertsWidget = () => {
  const [alerts, setAlerts] = useState(null);
  useEffect(() => {
    // Mock fetch
    setTimeout(() => {
      setAlerts([
        { title: 'MacBook Air M3', target: 95000, current: 98000 }
      ]);
    }, 600);
  }, []);

  if (!alerts) return <div className="h-32 bg-neutral-800/50 animate-pulse rounded-xl"></div>;

  return (
    <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
      <h3 className="text-lg font-bold text-neutral-100 mb-4 flex items-center gap-2">
        <Bell size={20} className="text-yellow-400" /> Active Alerts
      </h3>
      <div className="space-y-4">
        {alerts.map((item, idx) => (
          <div key={idx} className="p-3 bg-neutral-900 rounded-lg">
            <p className="font-semibold text-neutral-200">{item.title}</p>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-neutral-400">Target: ₹{item.target}</span>
              <span className="text-neutral-300">Current: ₹{item.current}</span>
            </div>
            <div className="w-full bg-neutral-700 h-1.5 mt-2 rounded-full overflow-hidden">
              <div className="bg-yellow-400 h-full" style={{ width: '80%' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-neutral-100">Welcome back, {user?.name || 'User'}</h1>
        <p className="text-neutral-400 mt-2">Here's your personalized shopping intelligence overview.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonalFeedWidget />
        <ActiveAlertsWidget />
      </div>

      {/* Placeholder for Recent Searches */}
      <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
        <h3 className="text-lg font-bold text-neutral-100 mb-4 flex items-center gap-2">
          <Clock size={20} className="text-blue-400" /> Recent Searches
        </h3>
        <p className="text-neutral-400 text-sm">Your recent searches will appear here.</p>
      </div>
    </div>
  );
};

export default DashboardPage;
