import React from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { ExternalLink, Truck, ShieldCheck } from 'lucide-react';

const RetailerTable = ({ retailers = [] }) => {
  if (!retailers || retailers.length === 0) return null;

  // Sort by price ascending
  const sortedRetailers = [...retailers].sort((a, b) => a.price - b.price);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 dark:text-gray-400">
            <th className="pb-4 pl-4 font-medium uppercase tracking-wider">Retailer</th>
            <th className="pb-4 font-medium uppercase tracking-wider">Price</th>
            <th className="pb-4 font-medium uppercase tracking-wider hidden md:table-cell">Benefits</th>
            <th className="pb-4 pr-4 font-medium uppercase tracking-wider text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {sortedRetailers.map((offer, index) => {
            const isLowest = index === 0;
            return (
              <tr key={offer.id || index} className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${isLowest ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}>
                <td className="py-5 pl-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center p-1">
                      {offer.logo ? (
                        <img src={offer.logo} alt={offer.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="font-bold text-xs">{offer.name?.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {offer.name}
                        {isLowest && <Badge variant="success" className="text-[10px] px-2 py-0">Best</Badge>}
                      </div>
                      <div className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3" /> Official Seller
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-white text-lg">₹{offer.price?.toLocaleString()}</span>
                    {offer.oldPrice && <span className="text-xs text-gray-400 line-through">₹{offer.oldPrice?.toLocaleString()}</span>}
                  </div>
                </td>
                <td className="py-5 hidden md:table-cell">
                  <div className="flex flex-col gap-1">
                    {offer.delivery && (
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 gap-1.5">
                        <Truck className="w-3.5 h-3.5" /> {offer.delivery}
                      </div>
                    )}
                    {offer.offer && (
                      <Badge variant="secondary" className="w-fit text-[10px]">{offer.offer}</Badge>
                    )}
                  </div>
                </td>
                <td className="py-5 pr-4 text-right">
                  <Button 
                    variant={isLowest ? 'primary' : 'secondary'} 
                    size="sm" 
                    className="w-full sm:w-auto"
                    onClick={() => window.open(offer.url, '_blank')}
                  >
                    View Offer <ExternalLink className="w-3 h-3 ml-1.5" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RetailerTable;
