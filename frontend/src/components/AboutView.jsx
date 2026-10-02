import React from 'react';
import { Layers, ShieldCheck, Database, Bot, ArrowRight, Video, Sparkles } from 'lucide-react';

export default function AboutView() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg mb-2">
          Project Architecture & Pipeline
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          How natural language questions are converted to Cypher, executed on Neo4j, and returned with grounded answers.
        </p>

        <div className="grid gap-4 sm:grid-cols-5 text-center">
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold">
              1
            </div>
            <div className="font-semibold text-xs text-slate-900 dark:text-white">User Question</div>
            <div className="text-[11px] text-slate-500 mt-1">Natural language input</div>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900/40 dark:bg-purple-950/20">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white text-xs font-bold">
              2
            </div>
            <div className="font-semibold text-xs text-slate-900 dark:text-white">LLM Stage 1</div>
            <div className="text-[11px] text-slate-500 mt-1">NL → Read-Only Cypher</div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white text-xs font-bold">
              3
            </div>
            <div className="font-semibold text-xs text-slate-900 dark:text-white">Cypher Validator</div>
            <div className="text-[11px] text-slate-500 mt-1">Blocks WRITE / INJECTIONS</div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold">
              4
            </div>
            <div className="font-semibold text-xs text-slate-900 dark:text-white">Neo4j Database</div>
            <div className="text-[11px] text-slate-500 mt-1">Executes Cypher on Graph</div>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold">
              5
            </div>
            <div className="font-semibold text-xs text-slate-900 dark:text-white">LLM Stage 2</div>
            <div className="text-[11px] text-slate-500 mt-1">Grounded Synthesis Only</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Loom Technical Walkthrough Guide</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">Recommended 5-step video presentation flow</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="font-bold text-xs text-blue-600 dark:text-blue-400">Demo 1: Normal Question</span>
            <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
              Run <em>"Which Samsung products are supplied by TechWorld?"</em>. Show generated Cypher query, actual Neo4j table records (Galaxy S25, Galaxy Buds), and final grounded answer.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="font-bold text-xs text-yellow-600 dark:text-yellow-400">Demo 2: Banana Requirement</span>
            <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
              Run <em>"How many banana values are there?"</em> (returns 5) and <em>"Find all banana nodes"</em> (returns BANANA_001 to BANANA_005). Show the Banana Verification tab.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="font-bold text-xs text-amber-600 dark:text-amber-400">Demo 3: Anti-Hallucination & Grounding</span>
            <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
              Ask <em>"Who is the CEO of Apple?"</em>. Explain that because this data does not exist in the graph, the model is strictly constrained to return <em>"The requested information is not available in the knowledge graph."</em>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">Demo 4: Graph Visualization & Entities</span>
            <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
              Switch to <strong>Graph Visualization</strong> to show the interactive canvas with Brand → Product → Vendor and Customer → Order → Product nodes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
