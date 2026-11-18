import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';
import { Package, Bell, TrendingDown, Clock } from 'lucide-react';
import axios from 'axios';

// Independent Widget: Personal Feed
const PersonalFeedWidget = ({ feedData, isLoading }) => {
  if (isLoading) return <div className="h-32 bg-neutral-800/50 animate-pulse rounded-xl"></div>;

  return (
    <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
      <h3 className="text-lg font-bold text-neutral-100 mb-4 flex items-center gap-2">
        <Package size={20} className="text-primary-400" /> Recommended For You
      </h3>
      {feedData && feedData.length > 0 ? (
        <div className="space-y-4">
          {feedData.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-neutral-900 rounded-lg">
              <div>
                <p className="font-semibold text-neutral-200">{item.title}</p>
                <p className="text-xs text-neutral-400">{item.reason || 'Recommended'}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-400">₹{item.price || item.lowestPrice}</p>
                <p className="text-xs text-primary-400">{item.deal || 'Check Price'}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-neutral-500 text-sm">
          No recommendations available yet. Try searching for products.
        </div>
      )}
    </div>
  );
};

// Independent Widget: Active Alerts
const ActiveAlertsWidget = ({ alertsData, isLoading }) => {
  if (isLoading) return <div className="h-32 bg-neutral-800/50 animate-pulse rounded-xl"></div>;

  return (
    <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
      <h3 className="text-lg font-bold text-neutral-100 mb-4 flex items-center gap-2">
        <Bell size={20} className="text-yellow-400" /> Active Alerts
      </h3>
      {alertsData && alertsData.length > 0 ? (
        <div className="space-y-4">
          {alertsData.map((item, idx) => (
            <div key={idx} className="p-3 bg-neutral-900 rounded-lg">
              <p className="font-semibold text-neutral-200">{item.product?.name || 'Tracked Product'}</p>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-neutral-400">Target: ₹{item.targetPrice}</span>
                <span className="text-neutral-300">Current: ₹{item.currentPrice || 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-neutral-500 text-sm">
          You have no active alerts.
        </div>
      )}
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/v1/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-neutral-100">Welcome back, {user?.name || 'User'}</h1>
        <p className="text-neutral-400 mt-2">Here's your personalized shopping intelligence overview.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonalFeedWidget feedData={dashboardData?.recommendations} isLoading={isLoading} />
        <ActiveAlertsWidget alertsData={dashboardData?.alerts} isLoading={isLoading} />
      </div>

      {/* Placeholder for Recent Searches */}
      <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
        <h3 className="text-lg font-bold text-neutral-100 mb-4 flex items-center gap-2">
          <Clock size={20} className="text-blue-400" /> Recent Searches
        </h3>
        {dashboardData?.searchHistory?.length > 0 ? (
          <ul className="space-y-2">
            {dashboardData.searchHistory.map((search, i) => (
              <li key={i} className="text-neutral-300 text-sm">{search.query}</li>
            ))}
          </ul>
        ) : (
          <p className="text-neutral-500 text-sm">Your recent searches will appear here.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
