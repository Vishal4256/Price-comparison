import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingDown, Loader2 } from 'lucide-react';
import { api } from '../../api';

export default function PriceHistoryChart({ product }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        if (!product?.id) return;
        setLoading(true);
        api.get(`/api/prices/${product.id}/history?days=${days}`)
            .then(res => {
                // The backend returns an array of records. We need to group them by date (recordedAt) to feed Recharts.
                const historyRaw = res.data.data;
                const grouped = {};
                
                historyRaw.forEach(record => {
                    // Extract just the YYYY-MM-DD string
                    const dateStr = new Date(record.recordedAt).toISOString().split('T')[0];
                    if (!grouped[dateStr]) {
                        grouped[dateStr] = { date: dateStr };
                    }
                    grouped[dateStr][record.retailer] = record.price;
                });
                
                // Convert back to array sorted by date
                const chartData = Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
                setData(chartData);
            })
            .catch(err => console.error("Failed to fetch history:", err))
            .finally(() => setLoading(false));
    }, [product?.id, days]);

    if (!product) return null;

    return (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-[#0B1E36]">Price History</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">Tracked across all major retailers</p>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-sm font-bold">
                    <TrendingDown className="w-4 h-4" />
                    Price is dropping
                </div>
            </div>

            {loading ? (
                <div className="h-[300px] w-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : data.length === 0 ? (
                <div className="h-[300px] w-full flex items-center justify-center text-slate-500 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Not enough historical data available yet.
                </div>
            ) : (
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                domain={['dataMin - 1000', 'dataMax + 1000']}
                                tickFormatter={(value) => `₹${value.toLocaleString()}`}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ color: '#0B1E36', fontWeight: 900 }}
                                formatter={(value) => `₹${value.toLocaleString()}`}
                            />
                            <Legend />
                            {Object.keys(data[0] || {}).filter(k => k !== 'date').map((retailer, i) => {
                                const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];
                                return (
                                    <Line 
                                        key={retailer}
                                        type="monotone" 
                                        dataKey={retailer} 
                                        name={retailer}
                                        stroke={colors[i % colors.length]} 
                                        strokeWidth={3}
                                        dot={false}
                                    />
                                );
                            })}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
