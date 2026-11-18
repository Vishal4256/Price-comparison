import React from 'react';
import { format } from 'date-fns';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const DashboardHeader = ({ account }) => {
  const { theme, toggleTheme } = useTheme();
  
  if (!account) return null;

  const today = format(new Date(), 'EEEE, MMMM do');
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 mb-8 border-b border-gray-100 dark:border-gray-800">
      <div>
        <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">{today}</p>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          {greeting}, {account.name} <span className="text-2xl animate-wave origin-bottom-right">👋</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Here's your personal PriceSmart command center.</p>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-white dark:border-gray-900">
          {account.name.charAt(0)}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
