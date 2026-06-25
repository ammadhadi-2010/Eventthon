import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, Pencil } from 'lucide-react';
import { ProjectDetailsHero, ProjectDetailsProgressGauge } from './ProjectDetailsProgress';
import ProjectDetailsOverview from './ProjectDetailsOverview';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'tasks', label: 'Tasks', countKey: 'tasks' },
  { id: 'team', label: 'Team', countKey: 'team' },
  { id: 'files', label: 'Files', countKey: 'files' },
  { id: 'activity', label: 'Activity' },
  { id: 'budget', label: 'Budget' },
];

const ACTION_ITEMS = ['Edit Project Details', 'Change Status', 'Archive Project'];

export default function ProjectDetailsView({ project, loading = false, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef(null);

  useEffect(() => {
    if (!actionsOpen) return undefined;
    const close = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) setActionsOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [actionsOpen]);

  if (!project) {
    return (
      <div className="text-white">
        <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft size={16} /> Back to Projects
        </button>
        <p className="text-slate-400">{loading ? 'Loading project…' : 'Project not found.'}</p>
      </div>
    );
  }

  return (
    <div className={`block w-full min-w-0 flex-1 overflow-y-auto text-white${loading ? ' opacity-80' : ''}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/[0.06]"
        >
          <ArrowLeft size={14} /> Back to Projects
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/[0.04]"
          >
            <Pencil size={14} /> Edit Project
          </button>
          <div className="relative" ref={actionsRef}>
            <button
              type="button"
              onClick={() => setActionsOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500"
            >
              Actions <ChevronDown size={14} />
            </button>
            {actionsOpen ? (
              <div className="absolute right-0 z-20 mt-2 min-w-[180px] rounded-xl border border-[#1f2228] bg-[#121418] p-1 shadow-xl">
                {ACTION_ITEMS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setActionsOpen(false)}
                    className="block w-full rounded-lg px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/5"
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        Dashboard &gt; Project Management &gt; {project.name}
      </p>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <ProjectDetailsHero project={project} />
        </div>
        <div className="min-w-0 lg:col-span-1">
          <ProjectDetailsProgressGauge project={project} />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-1 border-b border-white/[0.06]">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          const count = tab.countKey ? project.tabCounts?.[tab.countKey] : null;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 text-xs font-bold transition ${
                active ? 'text-violet-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
              {count != null ? (
                <span className="ml-1.5 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-black text-slate-300">
                  {count}
                </span>
              ) : null}
              {active ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-violet-500" /> : null}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' ? (
        <ProjectDetailsOverview project={project} />
      ) : (
        <article className="rounded-xl border border-white/[0.06] bg-[#121418] p-8 text-center">
          <p className="text-sm text-slate-400">
            {TABS.find((t) => t.id === activeTab)?.label} panel — coming soon.
          </p>
        </article>
      )}
    </div>
  );
}
