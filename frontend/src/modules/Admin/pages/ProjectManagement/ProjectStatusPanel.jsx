import React, { useMemo } from 'react';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';

const FALLBACK_SLICES = [
  { name: 'Completed', value: 0, color: '#14b8a6', share: '0%' },
  { name: 'In Progress', value: 0, color: '#8b5cf6', share: '0%' },
  { name: 'On Hold', value: 0, color: '#ec4899', share: '0%' },
  { name: 'Cancelled', value: 0, color: '#f97316', share: '0%' },
];

export default function ProjectStatusPanel({ slices = FALLBACK_SLICES, total = 0 }) {
  const data = slices.length ? slices : FALLBACK_SLICES;
  const centerTotal = total || data.reduce((sum, slice) => sum + Number(slice.value || 0), 0);
  const pieData = useMemo(
    () => data.filter((slice) => Number(slice.value) > 0),
    [data],
  );
  const chartSlices = pieData.length ? pieData : [{ name: 'Empty', value: 1, color: '#334155', share: '0%' }];

  return (
    <article className="flex h-full min-h-[360px] min-w-0 w-full flex-col rounded-xl border border-white/[0.06] bg-[#121418] p-4">
      <h3 className="mb-3 text-[15px] font-black text-white">Project Status</h3>

      <div className="relative block h-[320px] min-h-[320px] w-full min-w-0 flex-1">
        <div className="flex h-full w-full min-w-0 items-center gap-3">
          <div className="relative h-[148px] w-[148px] shrink-0">
            <PieChart width={148} height={148}>
              <Pie
                data={chartSlices}
                dataKey="value"
                cx={74}
                cy={74}
                innerRadius={44}
                outerRadius={66}
                paddingAngle={2}
                stroke="none"
              >
                {chartSlices.map((slice) => (
                  <Cell key={slice.name} fill={slice.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-black text-white">{centerTotal.toLocaleString()}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Total</p>
            </div>
          </div>

          <ul className="min-w-0 flex-1 space-y-2.5">
            {data.map((slice) => (
              <li key={slice.name} className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <div>
                  <p className="text-[12px] font-medium text-slate-200">{slice.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {slice.value} ({slice.share})
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
