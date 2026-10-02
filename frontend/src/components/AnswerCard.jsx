import React from 'react';
import { Bot, CheckCircle2, AlertCircle, Database } from 'lucide-react';

export default function AnswerCard({ answer, resultCount }) {
  if (!answer) return null;

  const isUnavailable = answer.toLowerCase().includes('not available in the knowledge graph');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">AI Grounded Answer</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Stage 2 Output</span>
          </div>
        </div>

        {!isUnavailable ? (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800/80 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Based on Graph Data ({resultCount} records)</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-800/80 dark:bg-amber-950/50 dark:text-amber-300">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
            <span>Anti-Hallucination Enforced</span>
          </div>
        )}
      </div>

      <div
        className={`rounded-xl p-4 text-sm leading-relaxed ${
          isUnavailable
            ? 'border border-amber-200 bg-amber-50/60 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200'
            : 'border border-emerald-100 bg-emerald-50/30 text-slate-800 dark:border-emerald-900/30 dark:bg-emerald-950/10 dark:text-slate-200'
        }`}
      >
        <p className="whitespace-pre-line font-medium">{answer}</p>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Database className="h-3.5 w-3.5 text-slate-400" />
        <span>Answer generated strictly from retrieved Neo4j knowledge nodes.</span>
      </div>
    </div>
  );
}
