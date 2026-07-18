import React from 'react';
import { Terminal, Download } from 'lucide-react';

export default function LogsTab() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Terminal className="w-6 h-6 text-indigo-500" />
                    <h2 className="text-2xl font-black text-[#0B1E36]">System Logs</h2>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-sm rounded-xl hover:bg-indigo-600 hover:text-white transition-colors">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>
            
            <div className="bg-[#0B1E36] rounded-3xl shadow-sm overflow-hidden p-6 font-mono text-xs md:text-sm text-blue-200">
                <div className="flex items-center gap-2 mb-4 text-slate-400 border-b border-white/10 pb-4">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="ml-2 font-sans font-bold">server.log (Live)</span>
                </div>
                
                <div className="space-y-2 h-[400px] overflow-y-auto">
                    <div className="text-slate-400">[2026-07-17 12:45:01] <span className="text-emerald-400">INFO</span> Server started on port 5000</div>
                    <div className="text-slate-400">[2026-07-17 12:45:03] <span className="text-emerald-400">INFO</span> Connected to MongoDB Cluster</div>
                    <div className="text-slate-400">[2026-07-17 12:46:12] <span className="text-blue-400">DEBUG</span> Incoming search request: "Gaming laptops"</div>
                    <div className="text-slate-400">[2026-07-17 12:46:13] <span className="text-emerald-400">INFO</span> Gemini Intent Extracted successfully.</div>
                    <div className="text-slate-400">[2026-07-17 12:46:13] <span className="text-blue-400">DEBUG</span> Spawning parallel scrapers (Amazon, Flipkart, Myntra)</div>
                    <div className="text-slate-400">[2026-07-17 12:46:15] <span className="text-amber-400">WARN</span> Myntra adapter responded with 0 items for intent "Laptops"</div>
                    <div className="text-slate-400">[2026-07-17 12:46:16] <span className="text-emerald-400">INFO</span> Aggregation complete. Returned 24 results.</div>
                    <div className="text-slate-400">[2026-07-17 12:50:00] <span className="text-rose-400">ERROR</span> /api/wishlist/alert - Unauthorized access attempt blocked.</div>
                    <div className="text-slate-400">[2026-07-17 12:51:22] <span className="text-emerald-400">INFO</span> User 8472 logged in.</div>
                    <div className="animate-pulse text-indigo-400 mt-4">Waiting for new logs...</div>
                </div>
            </div>
        </div>
    );
}
