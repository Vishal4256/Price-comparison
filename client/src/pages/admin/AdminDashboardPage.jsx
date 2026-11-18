import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboardPage = () => {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await axios.get('/api/admin/intelligence/dashboard');
        setTrends(res.data.data);
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, []);

  if (loading) return <div className="text-neutral-400">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-100">Overview</h1>
      
      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
          <p className="text-sm text-neutral-400">AI Latency</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-bold text-neutral-100">
              {trends?.operationalMetrics?.averageAiLatencyMs || 0}ms
            </h3>
            <span className="text-xs text-green-400 font-medium">▼ -12%</span>
          </div>
        </div>

        <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
          <p className="text-sm text-neutral-400">Prediction Accuracy</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-bold text-neutral-100">
              {trends?.operationalMetrics?.predictionAccuracyPct || 0}%
            </h3>
            <span className="text-xs text-green-400 font-medium">▲ +3%</span>
          </div>
        </div>

        <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
          <p className="text-sm text-neutral-400">Avg Discount Found</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-bold text-neutral-100">
              {trends?.operationalMetrics?.averageRetailerDiscountPct || 0}%
            </h3>
          </div>
        </div>

        <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
          <p className="text-sm text-neutral-400">Alert Delivery</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-3xl font-bold text-neutral-100">99.4%</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
