import React, { useState, useEffect } from 'react';
import { Activity, Server, Cpu, HardDrive, Loader2 } from 'lucide-react';
import { api } from '../../api';

export default function ScraperHealthTab() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/dashboard/scrapers')
            .then(res => setData(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-3xl border border-slate-200 p-24 flex flex-col items-center justify-center h-[500px]">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                <h3 className="font-bold text-slate-500">Pinging Scrapers...</h3>
            </div>
        );
    }

    const onlineCount = data.filter(d => d.status === 'online').length;
    const uptime = data.length ? Math.round((onlineCount / data.length) * 100) : 100;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Activity className="w-6 h-6 text-indigo-500" />
                <h2 className="text-2xl font-black text-[#0B1E36]">Scraper Engine Health</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 rounded-2xl">
                        <Server className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Global Uptime</div>
                        <div className="text-2xl font-black text-[#0B1E36]">{uptime}%</div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-4 bg-indigo-50 rounded-2xl">
                        <Cpu className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Scrapers</div>
                        <div className="text-2xl font-black text-[#0B1E36]">{onlineCount} / {data.length}</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Scraper Status & Metrics</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Platform</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Response Time</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Success Rate</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Failures (24h)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.map((retailer, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-bold text-[#0B1E36] capitalize">{retailer.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded ${
                                            retailer.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                            {retailer.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-slate-600">{retailer.averageResponseTime}ms</td>
                                    <td className="p-4 text-sm font-bold text-emerald-600">{retailer.successRate}%</td>
                                    <td className="p-4 text-sm font-medium text-slate-600">{retailer.timeoutCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
