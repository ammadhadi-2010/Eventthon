import React from 'react';
import { Eye, Users, UsersRound, FolderKanban, Target, Activity } from 'lucide-react';
import { formatStatK } from './viewFullProfileHeroUtils';

const STAT_ITEMS = [
  { label: 'Profile views', value: '3,140', Icon: Eye, tone: 'blue', box: 'box0' },
  { label: 'Connections', valueKey: 'connections', Icon: Users, tone: 'blue', box: 'box1' },
  { label: 'Squads', value: '12', Icon: UsersRound, tone: 'pink', box: 'box2' },
  { label: 'Projects', valueKey: 'projects', Icon: FolderKanban, tone: 'amber', box: 'box3' },
  { label: 'Success score', value: '98%', Icon: Target, tone: 'violet', box: 'box4' },
  { label: 'System impressions', value: '8,950', Icon: Activity, tone: 'cyan', box: 'box5' },
];

export default function ViewFullProfileHeroStats({ projectCount }) {
  return (
    <div className="vfph-stats">
      {STAT_ITEMS.map(({ label, value, valueKey, Icon, tone, box }) => {
        const displayValue =
          valueKey === 'connections'
            ? formatStatK(1200)
            : valueKey === 'projects'
              ? String(projectCount ?? 0)
              : value;

        return (
          <div key={label} className={`vfph-stat vfph-stat--${box}`}>
            <div className="vfph-stat__head">
              <span className={`vfph-stat__icon vfph-stat__icon--${tone}`}>
                <Icon size={16} strokeWidth={2} />
              </span>
              <span className="vfph-stat__label">{label}</span>
            </div>
            <div className="vfph-stat__value">{displayValue}</div>
          </div>
        );
      })}
    </div>
  );
}
