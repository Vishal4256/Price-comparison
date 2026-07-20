import React from 'react';
import useInstallPrompt from '../../hooks/useInstallPrompt';
import { Download, X } from 'lucide-react';
import { useState } from 'react';

const InstallPrompt = () => {
  const { isInstallable, triggerInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(
    localStorage.getItem('priceSmart_installDismissed') === 'true'
  );

  if (!isInstallable || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('priceSmart_installDismissed', 'true');
  };

  return (
    <div className="fixed bottom-[72px] md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-primary-900 border border-primary-700 p-4 rounded-xl shadow-2xl z-40 flex items-center gap-4 text-white">
      <div className="p-2 bg-primary-800 rounded-lg">
        <Download size={24} />
      </div>
      <div className="flex-1">
        <h4 className="font-bold">Install PriceSmart</h4>
        <p className="text-xs text-primary-200">Get offline access and price alerts</p>
      </div>
      <button 
        onClick={triggerInstall}
        className="px-3 py-1.5 bg-white text-primary-900 text-sm font-bold rounded-lg hover:bg-neutral-100 transition-colors"
      >
        Install
      </button>
      <button onClick={handleDismiss} className="p-1 text-primary-300 hover:text-white">
        <X size={16} />
      </button>
    </div>
  );
};

export default InstallPrompt;
