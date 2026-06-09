import React, { useState, useEffect } from 'react';
import { API_URL } from '../../lib/utils';

const SystemAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (!analytics) return <div>Loading analytics...</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 bg-surface rounded-2xl border border-outline-variant shadow-sm text-center">
          <p className="text-xs text-on-surface-variant font-bold uppercase mb-2">Total Users</p>
          <p className="text-4xl font-black">{analytics.stats.totalUsers}</p>
        </div>
        <div className="p-6 bg-surface rounded-2xl border border-outline-variant shadow-sm text-center">
          <p className="text-xs text-on-surface-variant font-bold uppercase mb-2">Total Orders</p>
          <p className="text-4xl font-black">{analytics.stats.totalOrders}</p>
        </div>
        <div className="p-6 bg-surface rounded-2xl border border-outline-variant shadow-sm text-center">
          <p className="text-xs text-on-surface-variant font-bold uppercase mb-2">Total Products</p>
          <p className="text-4xl font-black">{analytics.stats.totalProducts}</p>
        </div>
        <div className="p-6 bg-surface rounded-2xl border border-outline-variant shadow-sm text-center">
          <p className="text-xs text-on-surface-variant font-bold uppercase mb-2">Revenue</p>
          <p className="text-4xl font-black">${analytics.stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-surface p-6 rounded-2xl border border-outline-variant shadow-sm">
        <h2 className="text-xl font-bold mb-4">System Health & Activity</h2>
        <div className="h-64 flex items-center justify-center text-on-surface-variant border-2 border-dashed border-outline-variant rounded-xl">
          <p>Activity Graph Placeholder (Real-time data enabled)</p>
        </div>
      </div>
    </div>
  );
};

export default SystemAnalytics;
