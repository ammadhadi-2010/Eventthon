import React from 'react';
import { Eye, Users, UsersRound, FolderKanban, Target, Activity } from 'lucide-react';
import { formatStatK } from './viewFullProfileHeroUtils';

const STAT_ITEMS = [
  { label: 'Profile views', key: 'profile_views', Icon: Eye, tone: 'blue', box: 'box0' },
  { label: 'Connections', key: 'connections', Icon: Users, tone: 'blue', box: 'box1' },
  { label: 'Squads', key: 'squads', Icon: UsersRound, tone: 'pink', box: 'box2' },
  { label: 'Projects', key: 'projects', Icon: FolderKanban, tone: 'amber', box: 'box3' },
  { label: 'Success score', key: 'success_score', Icon: Target, tone: 'violet', box: 'box4', suffix: '%' },
  { label: 'System impressions', key: 'impressions', Icon: Activity, tone: 'cyan', box: 'box5' },
];

function fmtValue(key, stats, projectCount, suffix) {
  if (key === 'projects') return String(projectCount ?? stats?.projects ?? 0);
  const raw = stats?.[key];
  const n = Number(raw);
  if (!Number.isFinite(n)) return '0';
  if (suffix === '%') return n > 0 ? `${Math.round(n)}%` : '—';
  return n >= 1000 ? formatStatK(n) : String(Math.round(n));
}

export default function ViewFullProfileHeroStats({ projectCount, stats = {} }) {
  return (
    <div className="vfph-stats">
      {STAT_ITEMS.map(({ label, key, Icon, tone, box, suffix }) => (
        <div key={label} className={`vfph-stat vfph-stat--${box}`}>
          <div className="vfph-stat__head">
            <span className={`vfph-stat__icon vfph-stat__icon--${tone}`}>
              <Icon size={16} strokeWidth={2} />
            </span>
            <span className="vfph-stat__label">{label}</span>
          </div>
          <div className="vfph-stat__value">{fmtValue(key, stats, projectCount, suffix)}</div>
        </div>
      ))}
    </div>
  );
}
