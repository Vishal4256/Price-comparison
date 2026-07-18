import React from 'react';
import { Users, MoreVertical, Shield } from 'lucide-react';

export default function UsersTab() {
    const users = [
        { id: '1', name: 'Vishal Singh', email: 'vishal@example.com', role: 'admin', joined: '2026-07-15' },
        { id: '2', name: 'John Doe', email: 'john@example.com', role: 'user', joined: '2026-07-16' },
        { id: '3', name: 'Sarah Smith', email: 'sarah@example.com', role: 'user', joined: '2026-07-17' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <Users className="w-6 h-6 text-indigo-500" />
                <h2 className="text-2xl font-black text-[#0B1E36]">User Management</h2>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Joined</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-[#0B1E36]">{u.name}</div>
                                        <div className="text-xs text-slate-500">{u.email}</div>
                                    </td>
                                    <td className="p-4">
                                        {u.role === 'admin' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded">
                                                <Shield className="w-3 h-3" /> Admin
                                            </span>
                                        ) : (
                                            <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded">
                                                User
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm font-medium text-slate-600">{u.joined}</td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
