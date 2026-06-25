import React from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { STATUS_PILL_CLASS } from './projectData';

const PRIORITY_CLASS = {
  High: 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/25',
  Medium: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/25',
  Low: 'bg-slate-500/10 text-slate-400 ring-1 ring-slate-500/25',
};

function fmtMoney(n) {
  return `$${Number(n).toLocaleString()}`;
}

export function ProjectDetailsHero({ project }) {
  const pill = STATUS_PILL_CLASS[project.status] || STATUS_PILL_CLASS['In Progress'];
  const pri = PRIORITY_CLASS[project.priority] || PRIORITY_CLASS.Medium;

  return (
    <article className="rounded-xl border border-white/[0.06] bg-[#121418] p-5">
      <div className="flex flex-wrap gap-5">
        <img
          src={project.imageurl}
          alt=""
          className="h-20 w-20 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
        />
        <div className="min-w-0 flex-1">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pill}`}>
            {project.status}
          </span>
          <h2 className="mt-2 text-xl font-black text-white">{project.name}</h2>
          <p className="mt-1 text-sm text-slate-400">{project.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Project Manager</p>
              <div className="mt-1 flex items-center gap-2">
                <img src={project.manager.imageurl} alt="" className="h-7 w-7 rounded-full object-cover" />
                <span className="text-sm font-semibold text-white">{project.manager.name}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Priority</p>
              <span className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pri}`}>
                {project.priority}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Start Date</p>
              <p className="mt-1 text-sm font-semibold text-white">{project.startDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">End Date</p>
              <p className="mt-1 text-sm font-semibold text-white">{project.endDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Budget</p>
              <p className="mt-1 text-sm font-semibold text-white">{fmtMoney(project.budget.total)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Spent Budget</p>
              <p className="mt-1 text-sm font-semibold text-emerald-400">{fmtMoney(project.budget.spent)}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProjectDetailsProgressGauge({ project }) {
  const slices = project.progressSlices || [];
  return (
    <article className="rounded-xl border border-white/[0.06] bg-[#121418] p-5">
      <h3 className="mb-4 text-[15px] font-black text-white">Project Progress</h3>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative shrink-0" style={{ width: 148, height: 148 }}>
          <PieChart width={148} height={148}>
            <Pie data={slices} dataKey="value" cx={74} cy={74} innerRadius={48} outerRadius={68} paddingAngle={2} stroke="none">
              {slices.map((s) => (
                <Cell key={s.label} fill={s.color} />
              ))}
            </Pie>
          </PieChart>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-black text-white">{project.progress}%</p>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Completed</p>
          </div>
        </div>
        <ul className="min-w-0 flex-1 space-y-2">
          {slices.map((s) => (
            <li key={s.label} className="flex items-center gap-2 text-[12px]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-slate-300">{s.label}</span>
              <span className="ml-auto font-semibold text-slate-400">{s.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
