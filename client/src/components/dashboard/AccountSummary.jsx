import React from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { User, LogOut, Settings } from 'lucide-react';
import { format } from 'date-fns';

const AccountSummary = ({ account, stats }) => {
  if (!account) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
          {account.name.charAt(0)}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{account.name}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{account.email}</p>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Member Since</span>
          <span className="font-medium text-gray-900 dark:text-white">{format(new Date(account.memberSince), 'MMMM yyyy')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Wishlist Items</span>
          <span className="font-medium text-gray-900 dark:text-white">{stats?.wishlistCount || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Active Alerts</span>
          <span className="font-medium text-gray-900 dark:text-white">{stats?.alertsCount || 0}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Button variant="outline" className="w-full justify-start text-gray-700 dark:text-gray-300">
          <Settings className="w-4 h-4 mr-3" /> Account Settings
        </Button>
        <Button variant="outline" className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 border-transparent hover:border-red-100">
          <LogOut className="w-4 h-4 mr-3" /> Log Out
        </Button>
      </div>
    </Card>
  );
};

export default AccountSummary;
