import React from 'react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Image from '../common/Image';
import { Bell, ArrowRight } from 'lucide-react';

const PriceAlerts = ({ alerts = [] }) => {
  if (!alerts.length) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-gray-900 dark:text-white font-medium">No Active Alerts</h3>
        <p className="text-sm text-gray-500 mt-1">Set alerts on products to get notified when prices drop.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map(alert => {
        const isReached = alert.status === 'Reached';
        const progress = Math.min(100, (alert.targetPrice / alert.currentPrice) * 100);
        
        return (
          <div key={alert.id} className="flex flex-col sm:flex-row items-center gap-6 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors hover:border-primary-200">
            <div className="w-16 h-16 shrink-0 bg-gray-50 dark:bg-gray-900 rounded-xl p-2">
              <Image src={alert.image} alt={alert.productTitle} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
            </div>
            
            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-900 dark:text-white truncate pr-4">{alert.productTitle}</h4>
                <Badge variant={isReached ? 'success' : 'secondary'} className="shrink-0">{alert.status}</Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-500 dark:text-gray-400">Current: ₹{alert.currentPrice.toLocaleString()}</span>
                <span className="font-medium text-gray-900 dark:text-white">Target: ₹{alert.targetPrice.toLocaleString()}</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${isReached ? 'bg-green-500' : 'bg-primary-500'}`} 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <div className="shrink-0 w-full sm:w-auto flex sm:flex-col gap-2">
              {isReached ? (
                <Button variant="primary" size="sm" className="w-full">Buy Now</Button>
              ) : (
                <Button variant="outline" size="sm" className="w-full">Edit</Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PriceAlerts;
