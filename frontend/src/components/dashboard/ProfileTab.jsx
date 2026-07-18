import React from 'react';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfileTab() {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
                <User className="w-6 h-6 text-indigo-500" />
                <h2 className="text-2xl font-black text-[#0B1E36]">My Profile</h2>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-4xl font-black">
                        {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-[#0B1E36]">{user?.name}</h3>
                        <p className="text-slate-500 font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4" /> {user?.email}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Account Role</div>
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-indigo-500" /> {user?.role.toUpperCase()}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Member Since</div>
                        <div className="font-bold text-slate-800">July 2026</div>
                    </div>
                </div>

                <hr className="my-8 border-slate-100" />

                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors rounded-xl font-bold"
                >
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>
        </div>
    );
}
