import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const LINES = [
  { key: 'created', label: 'Created', color: '#3b82f6' },
  { key: 'completed', label: 'Completed', color: '#14b8a6' },
  { key: 'inProgress', label: 'In Progress', color: '#8b5cf6' },
];

const EMPTY_TIMELINE = [
  { month: 'Jan', created: 0, completed: 0, inProgress: 0 },
  { month: 'Feb', created: 0, completed: 0, inProgress: 0 },
  { month: 'Mar', created: 0, completed: 0, inProgress: 0 },
];

const CHART_HEIGHT = 280;

function OverviewTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const count = payload.find((p) => p.dataKey === 'inProgress')?.value ?? payload[0]?.value;
  return (
    <div className="rounded-lg border border-[#1f2228] bg-[#0f131a] px-3 py-2 shadow-2xl">
      <p className="text-xs font-bold text-white">{label}</p>
      <p className="text-[11px] font-medium text-violet-300">{count} Active Projects</p>
    </div>
  );
}

export default function ProjectOverviewPanel({ timeline = EMPTY_TIMELINE }) {
  const data = timeline.length ? timeline : EMPTY_TIMELINE;
  const maxY = Math.max(10, ...data.flatMap((row) => [row.created, row.completed, row.inProgress]));

  return (
    <article className="min-w-0 w-full rounded-xl border border-white/[0.06] bg-[#121418] p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[15px] font-black text-white">Projects Overview</h3>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-[#1f2228] bg-[#0b0e14] px-3 py-1 text-[10px] font-semibold text-slate-400"
          >
            This Year
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#1f2228] bg-[#0b0e14] px-3 py-1 text-[10px] font-semibold text-slate-400"
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-4 sm:gap-5">
        {LINES.map((line) => (
          <span key={line.key} className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: line.color }} />
            {line.label}
          </span>
        ))}
      </div>

      <div className="pm-overview-chart relative block w-full min-w-0">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} dy={6} />
            <YAxis
              domain={[0, maxY]}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<OverviewTooltip />} cursor={{ stroke: 'rgba(139,92,246,0.3)' }} />
            {LINES.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                strokeWidth={2.5}
                dot={{ r: 3, fill: line.color, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: line.color, stroke: '#fff', strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
