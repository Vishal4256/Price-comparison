import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNavigation from '../components/mobile/BottomNavigation';
import OfflineIndicator from '../components/mobile/OfflineIndicator';
import InstallPrompt from '../components/mobile/InstallPrompt';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <OfflineIndicator />
      <Navbar />
      <InstallPrompt />
      {/* Add padding-bottom on mobile to account for the bottom navigation */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {children}
      </main>
      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
