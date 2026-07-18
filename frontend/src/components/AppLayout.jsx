import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import AIAssistantWidget from './assistant/AIAssistantWidget';

export default function AppLayout({ isAuthenticated, setIsAuthenticated }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col relative">
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Global AI Assistant Widget (Only for Authenticated Users) */}
      {isAuthenticated && <AIAssistantWidget />}
    </div>
  );
}
