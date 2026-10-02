import React, { useState } from 'react';
import { Play, Terminal, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function ApiTestingView() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const endpoints = [
    {
      id: 'health',
      name: 'Service Health',
      method: 'GET',
      path: '/health',
      run: () => api.getHealth(),
    },
    {
      id: 'neo4j',
      name: 'Neo4j Database Status',
      method: 'GET',
      path: '/health/neo4j',
      run: () => api.getNeo4jHealth(),
    },
    {
      id: 'stats',
      name: 'Knowledge Graph Stats',
      method: 'GET',
      path: '/api/stats',
      run: () => api.getStats(),
    },
    {
      id: 'banana',
      name: 'Banana Verification Endpoint',
      method: 'GET',
      path: '/api/banana',
      run: () => api.getBananaNodes(),
    },
    {
      id: 'ask',
      name: 'Ask Question Pipeline',
      method: 'POST',
      path: '/api/ask',
      payload: { question: 'Which Samsung products are supplied by TechWorld?' },
      run: () => api.askQuestion('Which Samsung products are supplied by TechWorld?'),
    },
  ];

  const handleTest = async (ep) => {
    setLoading((prev) => ({ ...prev, [ep.id]: true }));
    const startTime = performance.now();
    const res = await ep.run();
    const duration = Math.round(performance.now() - startTime);

    setResults((prev) => ({
      ...prev,
      [ep.id]: {
        success: res.success,
        data: res.data || res.error,
        status: res.success ? 200 : 500,
        duration,
      },
    }));
    setLoading((prev) => ({ ...prev, [ep.id]: false }));
  };

  const testAll = async () => {
    for (const ep of endpoints) {
      await handleTest(ep);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
            API Testing & Verification Console
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Developer testing view to live-test and demonstrate all backend endpoints during interview/Loom video.
          </p>
        </div>

        <button
          onClick={testAll}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <Play className="h-3.5 w-3.5" />
          <span>Run All Endpoint Tests</span>
        </button>
      </div>

      <div className="space-y-4">
        {endpoints.map((ep) => {
          const res = results[ep.id];
          const isLoading = loading[ep.id];

          return (
            <div
              key={ep.id}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all dark:border-slate-800 dark:bg-slate-800/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-mono font-bold ${
                      ep.method === 'GET'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {ep.path}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">({ep.name})</span>
                </div>

                <div className="flex items-center gap-3">
                  {res && (
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`flex items-center gap-1 font-semibold ${
                          res.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {res.success ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5" />
                        )}
                        {res.status} OK
                      </span>
                      <span className="text-slate-400 font-mono">({res.duration}ms)</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleTest(ep)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                    <span>Test</span>
                  </button>
                </div>
              </div>

              {/* Response Code Block */}
              {res && (
                <div className="mt-3 overflow-hidden rounded-lg border border-slate-800 bg-navy-950 p-3 text-xs font-mono shadow-inner">
                  <pre className="text-emerald-400/90 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {JSON.stringify(res.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
