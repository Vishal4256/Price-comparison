import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { format, subDays } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-lg">
        <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{format(new Date(label), 'MMM dd, yyyy')}</p>
        <p className="text-gray-900 dark:text-white font-bold">
          ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const PriceHistoryChart = ({ history = [] }) => {
  const [timeRange, setTimeRange] = useState('30D');

  if (!history || history.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
        <span className="text-gray-400">No price history available</span>
      </div>
    );
  }

  // Filter history based on timeRange (mock implementation since data is limited)
  const filteredData = history; 
  
  // Find min and max for Y axis padding
  const prices = filteredData.map(d => d.price);
  const minPrice = Math.min(...prices) * 0.95;
  const maxPrice = Math.max(...prices) * 1.05;

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Price History</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track price drops over time</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {['7D', '30D', '90D', '1Y'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                timeRange === range 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-gray-700/50" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(date) => format(new Date(date), 'MMM dd')}
              minTickGap={30}
            />
            <YAxis 
              domain={[minPrice, maxPrice]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(value) => `₹${value.toLocaleString()}`}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#10B981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default PriceHistoryChart;
