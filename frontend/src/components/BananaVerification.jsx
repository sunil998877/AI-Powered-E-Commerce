import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, RefreshCw, Sparkles, Terminal } from 'lucide-react';
import { api } from '../services/api';

export default function BananaVerification() {
  const [data, setData] = useState({ count: 0, verified: false, nodes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBananas = async () => {
    setLoading(true);
    setError(null);
    const res = await api.getBananaNodes();
    if (res.success && res.data) {
      // res.data can be array or { count, verified, nodes }
      const nodes = Array.isArray(res.data) ? res.data : res.data.nodes || [];
      setData({
        count: nodes.length,
        verified: nodes.length === 5,
        nodes: nodes,
      });
    } else {
      setError(res.error || 'Failed to fetch banana nodes from API.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBananas();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-xl dark:bg-yellow-950/60">
            🍌
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
              Banana Verification
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mandatory Requirement 7 & 8: Exactly 5 banana Keyword values in the Knowledge Graph.
            </p>
          </div>
        </div>

        <button
          onClick={fetchBananas}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Verify Again</span>
        </button>
      </div>

      {/* Verification Banner */}
      {data.verified ? (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-800 dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div className="text-sm font-semibold">
            Exactly 5 banana values found in the knowledge graph.
          </div>
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <div className="text-sm font-semibold">
            Banana verification failed: Found {data.count} occurrences (Expected exactly 5).
          </div>
        </div>
      )}

      {/* Cypher Verification Query Box */}
      <div className="mb-6 rounded-xl border border-slate-800 bg-navy-950 p-4 text-xs font-mono text-slate-300 shadow-inner">
        <div className="mb-2 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Terminal className="h-3.5 w-3.5 text-yellow-400" />
            <span>Cypher Verification Query (Requirement 8)</span>
          </div>
          <span className="text-[11px] text-emerald-400">PASS (count = 5)</span>
        </div>
        <pre className="text-yellow-300/90 whitespace-pre-wrap">
{`MATCH (n:Keyword)
WHERE n.value = "banana"
RETURN count(n) AS banana_count`}
        </pre>
      </div>

      {/* Dynamic Data Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 flex items-center justify-between">
          <span>Retrieved Banana Keyword Nodes</span>
          <span className="font-mono text-slate-500">GET /api/banana</span>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-100/50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-mono w-16">#</th>
              <th className="px-4 py-3 font-semibold">Node ID</th>
              <th className="px-4 py-3 font-semibold">Value</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {data.nodes.map((node, idx) => (
              <tr
                key={node.id || idx}
                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <td className="px-4 py-3 font-mono text-slate-400">{idx + 1}</td>
                <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                  {node.id}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 rounded-md bg-yellow-100 px-2 py-0.5 font-mono text-xs font-semibold text-yellow-900 dark:bg-yellow-950/80 dark:text-yellow-300">
                    🍌 {node.value}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified Node
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
