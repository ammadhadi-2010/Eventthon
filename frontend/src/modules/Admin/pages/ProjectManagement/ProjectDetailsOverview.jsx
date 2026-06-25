import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const TASK_COLORS = {
  completed: '#14b8a6',
  inProgress: '#3b82f6',
  pending: '#64748b',
  overdue: '#ef4444',
};

export default function ProjectDetailsOverview({ project }) {
  const ts = project.tasksSummary;
  const segments = [
    { key: 'completed', label: 'Completed', count: ts.completed, color: TASK_COLORS.completed },
    { key: 'inProgress', label: 'In Progress', count: ts.inProgress, color: TASK_COLORS.inProgress },
    { key: 'pending', label: 'Pending', count: ts.pending, color: TASK_COLORS.pending },
    { key: 'overdue', label: 'Overdue', count: ts.overdue, color: TASK_COLORS.overdue },
  ];
  const pct = (n) => (ts.total ? `${((n / ts.total) * 100).toFixed(1)}%` : '0%');

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <article className="rounded-xl border border-white/[0.06] bg-[#121418] p-5 lg:col-span-1">
        <h3 className="text-[15px] font-black text-white">Project Overview</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">{project.description}</p>
        <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Key Features</p>
        <ul className="mt-2 space-y-2">
          {project.keyFeatures.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
              {f}
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-xl border border-white/[0.06] bg-[#121418] p-5 lg:col-span-1">
        <div className="flex items-center justify-between">
          <h3 className="text-[15px] font-black text-white">Tasks Summary</h3>
          <button type="button" className="text-xs font-bold text-violet-400 hover:text-violet-300">
            View All Tasks
          </button>
        </div>
        <p className="mt-2 text-2xl font-black text-white">
          {ts.total} <span className="text-sm font-semibold text-slate-500">Total Tasks</span>
        </p>
        <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-[#1f2228]">
          {segments.map((s) =>
            s.count > 0 ? (
              <div key={s.key} style={{ width: `${(s.count / ts.total) * 100}%`, backgroundColor: s.color }} />
            ) : null,
          )}
        </div>
        <ul className="mt-4 space-y-2">
          {segments.map((s) => (
            <li key={s.key} className="flex items-center justify-between text-[12px]">
              <span className="inline-flex items-center gap-2 text-slate-400">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
              <span className="font-semibold text-slate-300">
                {s.count} ({pct(s.count)})
              </span>
            </li>
          ))}
        </ul>
      </article>

      <article className="rounded-xl border border-white/[0.06] bg-[#121418] p-5 lg:col-span-1">
        <h3 className="text-[15px] font-black text-white">Timeline</h3>
        <ol className="mt-4 space-y-0">
          {project.timeline.map((step, i) => (
            <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
              {i < project.timeline.length - 1 ? (
                <span className="absolute left-[7px] top-4 h-full w-px bg-violet-500/30" aria-hidden />
              ) : null}
              <span className="relative z-[1] mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-violet-500 bg-[#121418]" />
              <div>
                <p className="text-sm font-semibold text-white">{step.label}</p>
                <p className="text-xs text-slate-500">{step.date}</p>
              </div>
            </li>
          ))}
        </ol>
      </article>
    </div>
  );
}
