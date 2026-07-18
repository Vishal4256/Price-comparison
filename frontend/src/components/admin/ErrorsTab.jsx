import React from 'react';
import { AlertOctagon, XCircle } from 'lucide-react';

export default function ErrorsTab() {
    const errors = [
        { id: 1, type: 'Scraper Timeout', source: 'Amazon Adapter', message: 'Connection reset by peer after 5000ms', time: '10 mins ago', severity: 'High' },
        { id: 2, type: 'Auth Token Expired', source: 'JWT Middleware', message: 'Token expired for user ID 8472', time: '45 mins ago', severity: 'Low' },
        { id: 3, type: 'API Rate Limit', source: 'Gemini Service', message: '429 Too Many Requests on compare endpoint', time: '2 hours ago', severity: 'Critical' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <AlertOctagon className="w-6 h-6 text-rose-500" />
                    <h2 className="text-2xl font-black text-[#0B1E36]">Error Tracking</h2>
                </div>
                <button className="px-4 py-2 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors">
                    Clear Logs
                </button>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Severity</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Error Type</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Source</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {errors.map(e => (
                                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded ${
                                            e.severity === 'Critical' ? 'bg-rose-100 text-rose-700' : 
                                            e.severity === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            <XCircle className="w-3 h-3" /> {e.severity}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{e.type}</div>
                                        <div className="text-xs text-slate-500 mt-1">{e.message}</div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-slate-600">{e.source}</td>
                                    <td className="p-4 text-sm font-medium text-slate-500">{e.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
