import React from 'react';
import { Activity, MousePointerClick, Database, Link as LinkIcon } from 'lucide-react';

const PartnerDashboardPage = () => {
  // Mock Data for UI presentation
  const stats = [
    { title: 'Total Clicks', value: '14,239', change: '+12%', icon: MousePointerClick, color: 'text-blue-400', bg: 'bg-blue-900/20' },
    { title: 'Active Products', value: '842', change: '+5', icon: Database, color: 'text-green-400', bg: 'bg-green-900/20' },
    { title: 'API Requests (24h)', value: '8,401', change: '84% of quota', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-900/20' },
    { title: 'Conversion Rate', value: '3.2%', change: '+0.4%', icon: LinkIcon, color: 'text-amber-400', bg: 'bg-amber-900/20' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
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
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">catalog_update_v2.csv</p>
                <p className="text-sm text-gray-500">Imported 842 records</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                COMPLETED
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">prices_daily.csv</p>
                <p className="text-sm text-gray-500">2 Fatal errors found</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                FAILED
              </span>
            </div>
          </div>
        </div>

        {/* API Usage */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Public API Usage</h3>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">STARTER Tier Quota</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">8,401 / 10,000</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: '84%' }}></div>
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
