import React from 'react';
import { api } from '../../api';
import { Tag, TrendingDown, Target, Zap, Trash2, CheckCircle } from 'lucide-react';

export default function NotificationPanel({ notifications, setNotifications, markAllRead, closePanel }) {

    const getIcon = (type) => {
        switch (type) {
            case 'PRICE_DROP': return <TrendingDown className="w-4 h-4 text-emerald-500" />;
            case 'TARGET_PRICE_REACHED': return <Target className="w-4 h-4 text-indigo-500" />;
            case 'COUPON_AVAILABLE': return <Tag className="w-4 h-4 text-amber-500" />;
            default: return <Zap className="w-4 h-4 text-blue-500" />;
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/api/engagement/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark read");
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/api/engagement/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error("Failed to delete");
        }
    };

    return (
        <div className="flex flex-col h-96">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-[#0B1E36]">Notifications</h3>
                <button onClick={markAllRead} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                    Mark all read
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Bell className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm font-medium">No new notifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map(n => (
                            <div key={n._id} className={`p-4 hover:bg-slate-50 transition-colors ${!n.isRead ? 'bg-indigo-50/30' : ''}`}>
                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-800">{n.title}</p>
                                        <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                                        <span className="text-[10px] font-bold text-slate-400 mt-2 block uppercase tracking-wider">
                                            {new Date(n.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {!n.isRead && (
                                            <button onClick={() => markAsRead(n._id)} className="text-slate-400 hover:text-indigo-600">
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button onClick={() => deleteNotification(n._id)} className="text-slate-400 hover:text-red-500">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
                <button onClick={closePanel} className="text-xs font-bold text-slate-500 hover:text-slate-700">
                    Close
                </button>
            </div>
        </div>
    );
}
