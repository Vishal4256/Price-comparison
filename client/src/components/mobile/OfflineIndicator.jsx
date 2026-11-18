import React from 'react';
import { WifiOff } from 'lucide-react';
import useOffline from '../../hooks/useOffline';

const OfflineIndicator = () => {
  const isOffline = useOffline();

  if (!isOffline) return null;

  return (
    <div className="w-full bg-yellow-600/90 text-white text-xs font-medium py-1.5 px-4 flex justify-center items-center gap-2 z-50 fixed top-0 left-0">
      <WifiOff size={14} />
      <span>Offline — showing cached data</span>
    </div>
  );
};

export default OfflineIndicator;
