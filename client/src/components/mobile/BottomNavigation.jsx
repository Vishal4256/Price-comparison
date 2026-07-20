import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Bell, LayoutDashboard } from 'lucide-react';

const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-neutral-950 border-t border-neutral-800 flex justify-around items-center p-3 z-50 md:hidden safe-area-bottom pb-6">
      <NavLink 
        to="/" 
        className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary-400' : 'text-neutral-500 hover:text-neutral-300'}`}
      >
        <Home size={24} />
        <span className="text-[10px] font-medium">Home</span>
      </NavLink>

      <NavLink 
        to="/search" 
        className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary-400' : 'text-neutral-500 hover:text-neutral-300'}`}
      >
        <Search size={24} />
        <span className="text-[10px] font-medium">Search</span>
      </NavLink>

      <NavLink 
        to="/alerts" 
        className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary-400' : 'text-neutral-500 hover:text-neutral-300'}`}
      >
        <Bell size={24} />
        <span className="text-[10px] font-medium">Alerts</span>
      </NavLink>

      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary-400' : 'text-neutral-500 hover:text-neutral-300'}`}
      >
        <LayoutDashboard size={24} />
        <span className="text-[10px] font-medium">Dashboard</span>
      </NavLink>
    </nav>
  );
};

export default BottomNavigation;
