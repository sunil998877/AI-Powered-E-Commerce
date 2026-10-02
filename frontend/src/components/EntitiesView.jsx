import React, { useState, useEffect } from 'react';
import { Boxes, Search, RefreshCw, Eye } from 'lucide-react';
import { api } from '../services/api';

export default function EntitiesView() {
  const [entities, setEntities] = useState({});
  const [activeType, setActiveType] = useState('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const entityTypes = [
    { key: 'products', label: 'Products', countKey: 'products' },
    { key: 'brands', label: 'Brands', countKey: 'brands' },
    { key: 'categories', label: 'Categories', countKey: 'categories' },
    { key: 'vendors', label: 'Vendors', countKey: 'vendors' },
    { key: 'customers', label: 'Customers', countKey: 'customers' },
    { key: 'orders', label: 'Orders', countKey: 'orders' },
    { key: 'keywords', label: 'Keywords (Banana)', countKey: 'keywords' },
  ];

  const fetchEntities = async () => {
    setLoading(true);
    setError(null);
    const res = await api.getEntities();
    if (res.success && res.data) {
      setEntities(res.data);
    } else {
      setError(res.error || 'Failed to fetch graph entities.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEntities();
  }, []);

  const currentList = entities[activeType] || [];
  const filteredList = currentList.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(item).some((val) =>
      String(val).toLowerCase().includes(term)
    );
  });

  const columns = currentList.length > 0 ? Object.keys(currentList[0]) : [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
            Knowledge Graph Entity Browser
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Inspect all raw nodes and properties stored inside the Neo4j Knowledge Graph.
          </p>
        </div>

        <button
          onClick={fetchEntities}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        {entityTypes.map((type) => {
          const count = entities[type.key]?.length ?? 0;
          const isActive = activeType === type.key;
          return (
            <button
              key={type.key}
              onClick={() => {
                setActiveType(type.key);
                setSearchTerm('');
              }}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <span>{type.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  isActive
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Filter ${activeType}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Showing {filteredList.length} of {currentList.length} entities
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin text-blue-500" />
            Loading entities from Neo4j...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No entities match your search filter.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 font-mono w-12 text-slate-400">#</th>
                {columns.map((col) => (
                  <th key={col} className="px-4 py-3 capitalize font-semibold">
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredList.map((row, idx) => (
                <tr
                  key={idx}
                  className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 font-mono text-slate-400">{idx + 1}</td>
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
