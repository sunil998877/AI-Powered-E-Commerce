import React from 'react';
import {
  MessageSquare,
  Share2,
  Boxes,
  HelpCircle,
  BarChart3,
  CheckCircle2,
  Terminal,
  Info,
  Layers,
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'ask', label: 'Ask Question', icon: MessageSquare },
    { id: 'graph', label: 'Graph Visualization', icon: Share2 },
    { id: 'entities', label: 'Entities', icon: Boxes },
    { id: 'samples', label: 'Sample Questions', icon: HelpCircle },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'banana', label: 'Banana Verification', icon: CheckCircle2, badge: '5' },
    { id: 'api-test', label: 'API Testing', icon: Terminal },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <aside className="flex w-64 flex-col justify-between border-r border-slate-200 bg-navy-950 p-4 text-slate-300 dark:border-slate-800">
      <div>
        <div className="mb-6 flex items-center gap-2.5 px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-sm">
            KG
          </div>
          <span className="font-semibold text-white tracking-wide text-sm">
            Knowledge Graph
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs">
        <div className="mb-2 flex items-center gap-2 font-semibold text-slate-300">
          <Layers className="h-3.5 w-3.5 text-blue-400" />
          <span>Tech Stack</span>
        </div>
        <div className="space-y-1.5 text-slate-400">
          <div className="flex items-center justify-between">
            <span>Frontend</span>
            <span className="font-mono text-slate-200">React + Vite</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Backend</span>
            <span className="font-mono text-slate-200">FastAPI</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Graph Database</span>
            <span className="font-mono text-emerald-400">Neo4j</span>
          </div>
          <div className="flex items-center justify-between">
            <span>LLM Provider</span>
            <span className="font-mono text-purple-400">OpenAI</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
