import React from 'react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass p-4 border border-white/10 rounded-2xl shadow-2xl">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">{label}</p>
                <p className="text-lg font-black text-white">₹{payload[0].value.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-green-400">Price tracked</p>
            </div>
        );
    }
    return null;
};

export default function PriceChart({ data }) {
    if (!data || data.length === 0) return null;

    const chartData = data.map(h => ({
        date: new Date(h.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        price: h.price
    }));

    return (
        <div className="w-full h-[400px] glass p-8 rounded-[40px] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex items-center justify-between mb-8 relative">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">Price Movement</h3>
                    <p className="text-xs text-gray-500">Historical price tracking for this product</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Market Price</span>
                    </div>
                </div>
            </div>

            <div className="w-full h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            stroke="#4b5563" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis 
                            stroke="#4b5563" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false}
                            tickFormatter={(value) => `₹${value/1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke="#2563eb" 
                            strokeWidth={4}
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
