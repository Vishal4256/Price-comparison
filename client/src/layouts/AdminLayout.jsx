import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, Activity, Server, BarChart3 } from 'lucide-react';
import { useAuth } from '../features/auth/context/AuthContext';

const AdminLayout = ({ children }) => {
  const { logout } = useAuth();

  return (
    <div className="flex h-screen bg-neutral-900 text-neutral-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            PriceSmart Admin
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive ? 'bg-primary-900/50 text-primary-400' : 'hover:bg-neutral-800/50 text-neutral-400 hover:text-neutral-200'
              }`
            }
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Overview</span>
          </NavLink>
          
          <NavLink
            to="/admin/market"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive ? 'bg-primary-900/50 text-primary-400' : 'hover:bg-neutral-800/50 text-neutral-400 hover:text-neutral-200'
              }`
            }
          >
            <BarChart3 size={20} />
            <span className="font-medium">Market Trends</span>
          </NavLink>

          <NavLink
            to="/admin/scrapers"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive ? 'bg-primary-900/50 text-primary-400' : 'hover:bg-neutral-800/50 text-neutral-400 hover:text-neutral-200'
              }`
            }
          >
            <Server size={20} />
            <span className="font-medium">Scraper Health</span>
          </NavLink>
          
          <NavLink
            to="/admin/jobs"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive ? 'bg-primary-900/50 text-primary-400' : 'hover:bg-neutral-800/50 text-neutral-400 hover:text-neutral-200'
              }`
            }
          >
            <Activity size={20} />
            <span className="font-medium">Background Jobs</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            <Settings size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-neutral-900">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
