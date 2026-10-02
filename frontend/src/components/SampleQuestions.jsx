import React from 'react';
import { HelpCircle, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

export default function SampleQuestions({ onSelectQuestion }) {
  const sampleCategories = [
    {
      title: 'Mandatory Technical Assessment Questions',
      questions: [
        {
          q: 'Which Samsung products are supplied by TechWorld?',
          desc: 'Tests Brand -> Product -> Vendor multi-hop graph retrieval',
          tag: 'Multi-Hop',
        },
        {
          q: 'What products did Rahul Kumar order?',
          desc: 'Tests Customer -> Order -> Product relationship traversal',
          tag: 'Orders',
        },
        {
          q: 'Which vendors supply Samsung products?',
          desc: 'Finds distinct vendors supplying Samsung brand devices',
          tag: 'Vendors',
        },
        {
          q: 'Which category does Galaxy S25 belong to?',
          desc: 'Direct Product -> Category property mapping',
          tag: 'Category',
        },
        {
          q: 'List all products with their vendors.',
          desc: 'Aggregated retrieval of all catalog products with supplier names',
          tag: 'Catalog',
        },
      ],
    },
    {
      title: 'Banana Requirement Verification',
      questions: [
        {
          q: 'How many banana values are there?',
          desc: 'Verifies aggregation returns exactly count = 5',
          tag: 'Banana Count',
          isBanana: true,
        },
        {
          q: 'Find all banana nodes.',
          desc: 'Retrieves all 5 Keyword nodes: BANANA_001 to BANANA_005',
          tag: 'Banana List',
          isBanana: true,
        },
      ],
    },
    {
      title: 'Anti-Hallucination & Grounding Check',
      questions: [
        {
          q: 'Who is the CEO of Apple?',
          desc: 'Verifies model returns: "The requested information is not available in the knowledge graph."',
          tag: 'Grounding',
          isGrounding: true,
        },
      ],
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
            Sample Questions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any question below to automatically execute the full AI retrieval pipeline against Neo4j.
          </p>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <Sparkles className="h-3.5 w-3.5" />
          Click to Run
        </span>
      </div>

      <div className="space-y-6">
        {sampleCategories.map((cat, idx) => (
          <div key={idx}>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {cat.title}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {cat.questions.map((item, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => onSelectQuestion(item.q)}
                  className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                    item.isBanana
                      ? 'border-yellow-200/80 bg-yellow-50/40 hover:border-yellow-300 dark:border-yellow-900/40 dark:bg-yellow-950/20'
                      : item.isGrounding
                      ? 'border-amber-200/80 bg-amber-50/40 hover:border-amber-300 dark:border-amber-900/40 dark:bg-amber-950/20'
                      : 'border-slate-200/80 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/20 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.isBanana
                          ? 'bg-yellow-200/80 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-300'
                          : item.isGrounding
                          ? 'bg-amber-200/80 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                      }`}
                    >
                      {item.tag}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      "{item.q}"
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
