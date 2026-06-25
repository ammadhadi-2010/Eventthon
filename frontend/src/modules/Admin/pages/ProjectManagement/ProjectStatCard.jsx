import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const THEMES = {
  violet: { color: '#8b5cf6', glow: 'shadow-[0_0_16px_rgba(139,92,246,0.12)]' },
  blue: { color: '#3b82f6', glow: 'shadow-[0_0_16px_rgba(59,130,246,0.12)]' },
  teal: { color: '#14b8a6', glow: 'shadow-[0_0_16px_rgba(20,184,166,0.12)]' },
  rose: { color: '#f43f5e', glow: 'shadow-[0_0_16px_rgba(244,63,94,0.12)]' },
};

export default function ProjectStatCard({
  title,
  value,
  percentage,
  trend = 'up',
  colorTheme = 'violet',
  icon: Icon,
}) {
  const theme = THEMES[colorTheme] || THEMES.violet;
  const isUp = trend === 'up';
  const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <article
      className={`flex h-[76px] max-h-[80px] items-center overflow-hidden rounded-xl border border-white/[0.06] bg-[#121418] px-4 py-3 ${theme.glow}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${theme.color}15`, color: theme.color }}
          >
            <Icon size={16} strokeWidth={2.5} aria-hidden />
          </div>
        ) : null}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-[11px] font-medium text-slate-400">{title}</p>
            <span
              className={`inline-flex shrink-0 items-center gap-0.5 text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              <TrendIcon size={10} aria-hidden />
              {percentage}
            </span>
          </div>

          <div className="mt-0.5 flex items-baseline gap-2">
            <p className="text-[20px] font-black leading-none tracking-tight text-white">{value}</p>
            <span className="whitespace-nowrap text-[9px] text-slate-500">vs last 30 days</span>
          </div>
        </div>
      </div>
    </article>
  );
}
