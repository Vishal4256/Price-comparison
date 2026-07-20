import React from 'react';
import { Heart, Bell, Target, PiggyBank } from 'lucide-react';
import { Card } from '../ui/Card';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <Card className="p-6 flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div>
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h4>
      <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{value}</div>
    </div>
  </Card>
);

const QuickStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
      <StatCard 
        title="Wishlisted" 
        value={stats.wishlistCount} 
        icon={Heart} 
        colorClass="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" 
      />
      <StatCard 
        title="Active Alerts" 
        value={stats.alertsCount} 
        icon={Bell} 
        colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
      />
      <StatCard 
        title="Tracked Products" 
        value={stats.trackedProducts} 
        icon={Target} 
        colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" 
      />
      <StatCard 
        title="Money Saved" 
        value={`₹${stats.moneySaved?.toLocaleString()}`} 
        icon={PiggyBank} 
        colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
      />
    </div>
  );
};

export default QuickStats;
