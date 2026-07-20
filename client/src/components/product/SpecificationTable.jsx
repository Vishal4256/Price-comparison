import React from 'react';

const SpecificationTable = ({ specifications }) => {
  if (!specifications || Object.keys(specifications).length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-left text-sm">
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {Object.entries(specifications).map(([key, value], idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-900'}>
              <th className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 w-1/3 border-r border-gray-200 dark:border-gray-700">{key}</th>
              <td className="py-3 px-4 text-gray-900 dark:text-gray-200">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SpecificationTable;
