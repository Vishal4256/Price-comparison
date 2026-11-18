import React from 'react';
import { Card } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { ShoppingCart, TrendingDown, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const LowestPriceCard = ({ lowestPrice, retailers = [] }) => {
  if (!lowestPrice) return null;

  const retailer = retailers.find(r => r.id === lowestPrice.retailerId) || retailers[0];
  const lastUpdated = lowestPrice.updatedAt ? formatDistanceToNow(new Date(lowestPrice.updatedAt), { addSuffix: true }) : 'Recently';

  return (
    <Card className="p-6 md:p-8 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-primary-100 dark:border-primary-900/50 shadow-lg relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-6">
        <Badge variant="success" className="px-3 py-1 text-sm flex items-center gap-1.5 shadow-sm">
          <TrendingDown className="w-4 h-4" /> Best Price Available
        </Badge>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="text-gray-500 dark:text-gray-400 font-medium mb-1">Current Lowest Price</div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              ₹{lowestPrice.price?.toLocaleString()}
            </span>
            {lowestPrice.oldPrice && (
              <span className="text-xl text-gray-400 line-through font-medium">
                ₹{lowestPrice.oldPrice.toLocaleString()}
              </span>
            )}
          </div>
          {lowestPrice.discount > 0 && (
            <div className="mt-2 text-green-600 dark:text-green-400 font-semibold text-sm">
              You save ₹{(lowestPrice.oldPrice - lowestPrice.price).toLocaleString()} ({lowestPrice.discount}%)
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center gap-3 flex-1">
          {retailer?.logo ? (
            <img src={retailer.logo} alt={retailer.name} className="h-8 object-contain" />
          ) : (
            <span className="font-bold text-gray-700 dark:text-gray-300">{retailer?.name || 'Unknown Retailer'}</span>
          )}
          <div className="flex items-center text-xs text-gray-500 gap-1 ml-auto">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated {lastUpdated}</span>
          </div>
        </div>
        
        <Button 
          variant="primary" 
          size="lg" 
          className="w-full sm:w-auto min-w-[200px] text-base"
          onClick={() => window.open(lowestPrice.url, '_blank')}
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Buy Now
        </Button>
      </div>
    </Card>
  );
};

export default LowestPriceCard;
