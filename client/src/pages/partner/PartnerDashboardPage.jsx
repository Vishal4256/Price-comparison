import React, { useState, useEffect } from 'react';
import { Activity, MousePointerClick, Database, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';

const PartnerDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/v1/partner/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(res.data.data);
      } catch (error) {
        console.error('Failed to fetch partner dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-8 text-neutral-400 animate-pulse">Loading partner dashboard...</div>;
  if (!dashboardData) return <div className="p-8 text-red-400">Failed to load dashboard.</div>;

  const { stats, recentFeeds } = dashboardData;

  const getIcon = (title) => {
    switch (title) {
      case 'Total Clicks': return MousePointerClick;
      case 'Active Products': return Database;
      case 'API Requests': return Activity;
      default: return LinkIcon;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats && stats.map((stat, idx) => {
          const Icon = getIcon(stat.title);
          return (
            <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm font-medium text-green-500">{stat.change}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">vs last week</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Feed Imports */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Feed Imports</h3>
          {recentFeeds && recentFeeds.length > 0 ? (
            <div className="space-y-4">
              {recentFeeds.map((feed, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Feed Job #{feed._id?.slice(-6)}</p>
                    <p className="text-sm text-gray-500">Progress: {feed.progress}%</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    feed.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    feed.status === 'FAILED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {feed.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent feed imports.</p>
          )}
        </div>

        {/* API Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Public API Usage</h3>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">STARTER Tier Quota</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">0 / 10,000</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: '0%' }}></div>
            </div>
          </div>
          <button className="w-full py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg font-medium transition-colors">
            Manage API Keys
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboardPage;
