import React, { useState, useEffect } from 'react';
import {
  Package,
  Award,
  Bookmark,
  Truck,
  Users,
  ShoppingBag,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';

export default function StatsCard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    const res = await api.getStats();
    if (res.success && res.data) {
      setStats(res.data);
    } else {
      setError(res.error || 'Failed to fetch graph statistics.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const items = [
    { label: 'Products', key: 'products', icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Brands', key: 'brands', icon: Award, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Categories', key: 'categories', icon: Bookmark, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/40' },
    { label: 'Vendors', key: 'vendors', icon: Truck, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Customers', key: 'customers', icon: Users, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/40' },
    { label: 'Orders', key: 'orders', icon: ShoppingBag, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/40' },
    { label: 'Banana Nodes', key: 'banana', icon: Sparkles, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/40', badge: 'Req. 7' },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
            Knowledge Graph Statistics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time entity counts fetched dynamically from Neo4j via <code className="font-mono text-blue-600 dark:text-blue-400">GET /api/stats</code>
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {items.map((item) => {
            const Icon = item.icon;
            const count = stats ? stats[item.key] ?? 0 : '-';
            return (
              <div
                key={item.key}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:border-slate-300 hover:shadow-xs dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-800 dark:bg-yellow-950/80 dark:text-yellow-300">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {loading ? '...' : count}
                  </div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
