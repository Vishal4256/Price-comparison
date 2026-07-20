import React from 'react';

const SpecificationsComparison = ({ products = [], specifications = [] }) => {
  if (!products.length || !specifications.length) return null;

  // Extract all unique specification keys across all products
  const allKeys = new Set();
  specifications.forEach(item => {
    Object.keys(item.specs || {}).forEach(key => allKeys.add(key));
  });
  
  const specsList = Array.from(allKeys);

  return (
    <div className="overflow-x-auto pb-4">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 hidden">
            <th className="w-1/5">Spec</th>
            {products.map(p => <th key={p.id} className="w-1/4">{p.title}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
          {specsList.map((specKey, idx) => {
            // Check if this spec is identical across all products
            const allValues = products.map(p => {
              const prodSpecs = specifications.find(s => s.productId === p.id)?.specs;
              return prodSpecs ? prodSpecs[specKey] : undefined;
            });
            const isIdentical = allValues.every(val => val === allValues[0] && val !== undefined);

            return (
              <tr key={specKey} className={idx % 2 === 0 ? 'bg-gray-50/30 dark:bg-gray-900/20' : 'bg-white dark:bg-gray-900'}>
                <td className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400 w-1/5 border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 sticky left-0">
                  {specKey}
                </td>
                {products.map(product => {
                  const prodSpecs = specifications.find(s => s.productId === product.id)?.specs;
                  const val = prodSpecs ? prodSpecs[specKey] : '-';
                  return (
                    <td key={product.id} className={`py-4 px-4 text-center ${!isIdentical ? 'text-gray-900 dark:text-white font-medium bg-indigo-50/30 dark:bg-indigo-900/10' : 'text-gray-600 dark:text-gray-400'}`}>
                      {val || '-'}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SpecificationsComparison;
