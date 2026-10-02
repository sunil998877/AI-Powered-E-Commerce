import React from 'react';
import { Table, Database, FileSpreadsheet } from 'lucide-react';

export default function ResultsTable({ results }) {
  if (!results) return null;

  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <Database className="h-6 w-6" />
        </div>
        <h4 className="font-semibold text-slate-800 dark:text-slate-200">No Matching Records</h4>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          The Cypher query executed successfully, but returned 0 rows from the Knowledge Graph.
        </p>
      </div>
    );
  }

  // Extract columns dynamically from the first record
  const columns = Object.keys(results[0]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Retrieved Graph Data</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Neo4j Database Records</span>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {results.length} {results.length === 1 ? 'row' : 'rows'} returned
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 text-slate-400 font-mono w-12">#</th>
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 capitalize">
                  {col.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {results.map((row, idx) => (
              <tr
                key={idx}
                className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
              >
                <td className="px-4 py-3 font-mono text-slate-400">{idx + 1}</td>
                {columns.map((col) => {
                  const val = row[col];
                  const displayVal =
                    typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);
                  return (
                    <td key={col} className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {displayVal}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
