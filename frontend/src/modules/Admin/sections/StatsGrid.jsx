import React, { memo, useMemo } from 'react';
import { ArrowUpRight, Briefcase, FolderKanban, TrendingUp, Users, Wallet } from 'lucide-react';
import StatsGridSkeleton from '../components/skeleton/StatsGridSkeleton';
import MiniTrendChart from './charts/MiniTrendChart';

const DEFAULT_POINTS = [12, 16, 14, 20, 18, 22, 19];

const ICON_MAP = {
  users: Users,
  squads: Briefcase,
  projects: FolderKanban,
  gigs: Briefcase,
  revenue: Wallet,
};

function resolveStatIcon(stat) {
  if (typeof stat?.icon === 'function') return stat.icon;
  if (typeof stat?.icon === 'string' && ICON_MAP[stat.icon]) return ICON_MAP[stat.icon];
  const label = String(stat?.label || '').toLowerCase();
  if (label.includes('user')) return Users;
  if (label.includes('squad')) return Briefcase;
  if (label.includes('project')) return FolderKanban;
  if (label.includes('gig')) return Briefcase;
  if (label.includes('revenue')) return Wallet;
  return TrendingUp;
}

function StatCard({ stat, Trend }) {
  const Icon = resolveStatIcon(stat);
  const points = Array.isArray(stat.points) && stat.points.length ? stat.points : DEFAULT_POINTS;
  const iconWrapStyle = useMemo(
    () => ({ backgroundColor: `${stat.color}18`, color: stat.color }),
    [stat.color],
  );
  const changeStyle = useMemo(() => ({ color: stat.color }), [stat.color]);

  return (
    <div className="admin-stat-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{stat.label}</p>
          <div className="mt-2 text-[26px] font-black tracking-tight">{stat.value}</div>
        </div>
        <div className="rounded-xl p-2.5" style={iconWrapStyle}>
          <Icon size={16} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[11px] font-bold" style={changeStyle}>
          <Trend size={12} />
          {stat.change}
        </div>
        <div className="text-[10px] text-slate-500">{stat.detail}</div>
      </div>
      <div className="admin-stat-strip mt-4">
        <MiniTrendChart color={stat.color} points={points} />
      </div>
    </div>
  );
}

const MemoStatCard = memo(StatCard);

function StatsGrid({ stats = [], TrendIcon, loading = false }) {
  const Trend = TrendIcon || ArrowUpRight;

  if (loading) {
    return <StatsGridSkeleton />;
  }

  if (!stats.length) {
    return <p className="um-table-empty">No dashboard stats available.</p>;
  }

  return (
    <div className="admin-stats-grid">
      {stats.map((stat) => (
        <MemoStatCard key={stat.label} stat={stat} Trend={Trend} />
      ))}
    </div>
  );
}

export default memo(StatsGrid);
