import React, { useState, useEffect } from 'react';
import { BellRing, Check, Clock, Trash2 } from 'lucide-react';
import axios from 'axios';

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAlert = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/alerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAlerts(); // Refresh list
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll every 60 seconds
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-neutral-400 animate-pulse">Loading alerts...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-100">Alert Center</h1>
          <p className="text-neutral-400 mt-2">Manage your price drop and restock notifications.</p>
        </div>
        <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2">
          <Check size={18} /> Mark All Read
        </button>
      </div>

      <div className="space-y-4">
        {alerts.length > 0 ? alerts.map(alert => (
          <div key={alert._id} className={`flex items-center justify-between p-5 rounded-xl border ${alert.status === 'Reached' ? 'bg-green-900/20 border-green-800/50' : 'bg-neutral-800 border-neutral-700'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${alert.status === 'Reached' ? 'bg-green-900/50 text-green-400' : 'bg-neutral-700/50 text-yellow-400'}`}>
                <BellRing size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-neutral-200">{alert.product?.name || 'Tracked Product'}</h3>
                <div className="flex gap-4 mt-1 text-sm text-neutral-400">
                  <span>Target: ₹{alert.targetPrice}</span>
                  <span className={alert.status === 'Reached' ? 'text-green-400 font-bold' : ''}>
                    Status: {alert.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${alert.status === 'Reached' ? 'bg-green-900/50 text-green-400' : 'bg-neutral-700 text-neutral-300'}`}>
                  {alert.status}
                </span>
                <p className="text-xs text-neutral-500 mt-2 flex items-center gap-1 justify-end"><Clock size={12}/> Updated {new Date(alert.updatedAt).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => deleteAlert(alert._id)}
                className="p-2 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-red-400 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center p-8 border border-neutral-700 rounded-xl bg-neutral-800/50">
            <p className="text-neutral-400">You don't have any active alerts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
