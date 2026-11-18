import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const ProductTimeline = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
      <h3 className="text-lg font-semibold text-neutral-100 mb-6">Price Timeline & Forecast</h3>
      
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#666" 
              tick={{ fill: '#666', fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              stroke="#666" 
              tick={{ fill: '#666', fontSize: 12 }}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
              itemStyle={{ color: '#e5e5e5' }}
              formatter={(value) => [`₹${value}`, 'Price']}
            />
            
            {/* Today Reference Line */}
            <ReferenceLine x="Today" stroke="#8b5cf6" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#8b5cf6', fontSize: 12 }} />

            {/* Historical Line (Solid) */}
            <Line 
              type="monotone" 
              dataKey="historicalPrice" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
            
            {/* Prediction Line (Dashed) */}
            <Line 
              type="monotone" 
              dataKey="predictedPrice" 
              stroke="#10b981" 
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-6">
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          Historical Price
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          AI Forecast
        </div>
      </div>
    </div>
  );
};

export default ProductTimeline;
