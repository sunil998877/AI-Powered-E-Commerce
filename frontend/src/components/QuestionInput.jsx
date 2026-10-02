import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function QuestionInput({
  onAsk,
  onSubmit,
  loading,
  isLoading,
  currentQuestion,
  question,
  setCurrentQuestion,
  setQuestion,
  loadingStep: externalLoadingStep,
  error,
}) {
  const effectiveQuestion = currentQuestion !== undefined ? currentQuestion : (question !== undefined ? question : '');
  const setEffectiveQuestion = setCurrentQuestion || setQuestion || (() => {});
  const effectiveOnAsk = onSubmit || onAsk || (() => {});
  const effectiveLoading = loading !== undefined ? loading : !!isLoading;

  const [internalLoadingStep, setInternalLoadingStep] = useState(0);

  const steps = [
    'Analyzing natural language question...',
    'Generating read-only Cypher query with LLM...',
    'Validating & querying Neo4j Knowledge Graph...',
    'Synthesizing grounded answer strictly from graph data...',
  ];

  useEffect(() => {
    let interval;
    if (effectiveLoading) {
      setInternalLoadingStep(0);
      interval = setInterval(() => {
        setInternalLoadingStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 600);
    } else {
      setInternalLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [effectiveLoading]);

  const currentStep = externalLoadingStep !== undefined ? externalLoadingStep : internalLoadingStep;

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const trimmed = (effectiveQuestion || '').trim();
    if (!trimmed || effectiveLoading) return;
    effectiveOnAsk(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
            Ask Your Knowledge Graph
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Natural language queries are translated to Cypher, executed on Neo4j, and returned with grounded answers.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          Two-Stage LLM Pipeline
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 text-slate-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={effectiveQuestion}
            onChange={(e) => setEffectiveQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={effectiveLoading}
            placeholder="Ask a question about your e-commerce knowledge graph..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-12 pr-12 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-900"
          />
          {effectiveQuestion && !effectiveLoading && (
            <button
              type="button"
              onClick={() => setEffectiveQuestion('')}
              className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={!(effectiveQuestion || '').trim() || effectiveLoading}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {effectiveLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing Question...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Ask Question</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Progress Stepper during loading */}
      {effectiveLoading && (
        <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
          <div className="space-y-2">
            {steps.map((stepText, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                    isCurrent
                      ? 'font-semibold text-indigo-700 dark:text-indigo-300'
                      : isPast
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 opacity-60 dark:text-slate-500'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-700" />
                  )}
                  <span>{stepText}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="leading-relaxed">{error}</div>
        </div>
      )}
    </div>
  );
}
