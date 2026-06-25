import React, { memo } from 'react';

const TONE_CLASS = {
  up: 'text-emerald-400',
  down: 'text-rose-400',
  neutral: 'text-slate-300',
};

function PlatformOverviewSpikeGrid({ metrics = [] }) {
  if (!metrics.length) return null;

  return (
    <div className="grid h-full grid-cols-2 gap-2">
      {metrics.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5"
        >
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
          <p className={`mt-1 text-lg font-black ${TONE_CLASS[item.tone] || TONE_CLASS.neutral}`}>
            {item.value}
          </p>
          <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{item.hint}</p>
        </div>
      ))}
    </div>
  );
}

export default memo(PlatformOverviewSpikeGrid);
