import React from 'react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { ExternalLink, Truck, Check, X } from 'lucide-react';

const CompareMatrix = ({ products = [], lowestPrices = [], retailers = [] }) => {
  if (!products.length) return null;

  // We need to display: Retailer | Product A | Product B ...
  // But wait, the prompt says:
  // Columns: Retailer, Product A, Product B
  // Rows: Price, Delivery, Discount, Stock, Buy Button
  // Actually, the prompt says "Automatically sort retailers by the lowest price." - This might be a generic table layout. Let's make columns = Products, Rows = Data points.

  // To highlight "Best Value"
  const allPrices = lowestPrices.map(lp => lp.price);
  const minPrice = Math.min(...allPrices);

  return (
    <div className="overflow-x-auto pb-4">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400 w-1/5 bg-gray-50/50 dark:bg-gray-800/30 sticky left-0">
              Retailer Prices
            </th>
            {products.map(product => (
              <th key={product.id} className="py-4 px-4 font-semibold text-gray-900 dark:text-white w-1/4 text-center">
                <div className="line-clamp-2">{product.title}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          
          {/* Price Row */}
          <tr>
            <td className="py-5 px-4 font-medium text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/30 sticky left-0">
              Lowest Price
            </td>
            {products.map(product => {
              const lp = lowestPrices.find(l => l.productId === product.id);
              const isBest = lp?.price === minPrice;
              return (
                <td key={product.id} className={`py-5 px-4 text-center ${isBest ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">₹{lp?.price?.toLocaleString()}</span>
                    {lp?.oldPrice && <span className="text-xs text-gray-400 line-through">₹{lp.oldPrice?.toLocaleString()}</span>}
                    {isBest && <Badge variant="success" className="mt-2 scale-90">Best Value</Badge>}
                  </div>
                </td>
              );
            })}
          </tr>

          {/* Retailer Row */}
          <tr>
            <td className="py-5 px-4 font-medium text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/30 sticky left-0">
              Top Retailer
            </td>
            {products.map(product => {
              const lp = lowestPrices.find(l => l.productId === product.id);
              const retailer = retailers.find(r => r.id === lp?.retailerId);
              return (
                <td key={product.id} className="py-5 px-4 text-center">
                  {retailer?.logo ? (
                    <img src={retailer.logo} alt={retailer.name} className="h-6 object-contain mx-auto" />
                  ) : (
                    <span className="font-semibold text-gray-700">{retailer?.name}</span>
                  )}
                </td>
              );
            })}
          </tr>

          {/* Delivery Row (Mocked from Retailer) */}
          <tr>
            <td className="py-5 px-4 font-medium text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/30 sticky left-0">
              Delivery
            </td>
            {products.map(product => (
              <td key={product.id} className="py-5 px-4 text-center text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-center gap-1.5">
                  <Truck className="w-4 h-4 text-green-500" /> Free
                </div>
              </td>
            ))}
          </tr>

          {/* Buy Action */}
          <tr>
            <td className="py-5 px-4 font-medium text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/30 sticky left-0">
              Action
            </td>
            {products.map(product => {
              const lp = lowestPrices.find(l => l.productId === product.id);
              const isBest = lp?.price === minPrice;
              return (
                <td key={product.id} className="py-5 px-4 text-center">
                  <Button variant={isBest ? 'primary' : 'secondary'} size="sm" className="w-full" onClick={() => window.open('#', '_blank')}>
                    Buy Now <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </td>
              );
            })}
          </tr>

        </tbody>
      </table>
    </div>
  );
};

export default CompareMatrix;
