import React from 'react';
import { Database, Server, Sun, Moon, RefreshCw, Cpu } from 'lucide-react';

export default function Header({
  apiOnline,
  apiStatus,
  neo4jOnline,
  neo4jStatus,
  darkMode,
  isDark,
  toggleDarkMode,
  setIsDark,
  checkingStatus,
  isRefreshing,
  refreshStatus,
  onRefresh,
}) {
  const isApiUp = apiOnline !== undefined ? apiOnline : apiStatus === 'online';
  const isNeo4jUp =
    neo4jOnline !== undefined
      ? neo4jOnline
      : neo4jStatus === 'connected' || neo4jStatus === true;

  const dark = darkMode !== undefined ? darkMode : (isDark !== undefined ? isDark : false);

  const handleToggleDark = () => {
    if (toggleDarkMode) {
      toggleDarkMode();
    } else if (setIsDark) {
      setIsDark(!dark);
    }
  };

  const isBusy =
    checkingStatus !== undefined ? checkingStatus : (isRefreshing !== undefined ? isRefreshing : false);

  const handleRefresh = onRefresh || refreshStatus || (() => {});

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-3.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
          <Cpu className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl flex items-center gap-2">
            AI-Powered E-Commerce Knowledge Graph
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Neo4j + LLM
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Natural Language Cypher Generation & Grounded Graph Retrieval
          </p>
        </div>
      </div>

      {/* Right controls: Service badges & Theme toggle */}
      <div className="flex items-center gap-3">
        {/* Neo4j Status Badge */}
        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
            isNeo4jUp
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span
            className={`h-2 w-2 rounded-full ${
              isNeo4jUp ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span>{isNeo4jUp ? 'Neo4j Connected' : 'Neo4j Offline'}</span>
        </div>

        {/* API Status Badge */}
        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
            isApiUp
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
          }`}
        >
          <Server className="h-3.5 w-3.5" />
          <span
            className={`h-2 w-2 rounded-full ${
              isApiUp ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
          <span>{isApiUp ? 'API Online' : 'API Offline'}</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={isBusy}
          title="Refresh Services Status"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RefreshCw className={`h-4 w-4 ${isBusy ? 'animate-spin text-indigo-600' : ''}`} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={handleToggleDark}
          title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {dark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
}
