import React from 'react';

import {

  Activity,

  ArrowDownRight,

  ArrowUpRight,

  BadgeCheck,

  UserPlus,

  Users,

  UserX,

} from 'lucide-react';



const STAT_ICONS = {

  users: Users,

  activity: Activity,

  badgeCheck: BadgeCheck,

  userPlus: UserPlus,

  userX: UserX,

};



const DESKTOP_COL_CLASS = {

  4: 'lg:grid-cols-4',

  5: 'lg:grid-cols-5',

};



export default function UserManagementStats({ stats, desktopCols }) {

  const cols = desktopCols || stats.length;

  const desktopGrid = DESKTOP_COL_CLASS[cols] || 'lg:grid-cols-5';



  return (

    <div

      className={`um-stats-track flex w-full flex-row gap-3 overflow-x-auto px-1 scrollbar-none snap-x snap-mandatory lg:grid ${desktopGrid} lg:gap-4 lg:overflow-visible lg:snap-none${cols === 4 ? ' um-stats-track--cols-4' : ''}`}

    >

      {stats.map((stat) => {

        const Icon = STAT_ICONS[stat.icon] || Users;

        return (

          <div

            key={stat.id}

            className={`um-stat-card um-stat-card--${stat.id} w-[calc(50%-12px)] shrink-0 snap-start shadow-lg lg:w-auto lg:shrink`}

          >

            <div className="um-stat-card__row">

              <div className="um-stat-card__text min-w-0">

                <p className="um-stat-label">{stat.label}</p>

                <p className="um-stat-value">{stat.value}</p>

              </div>

              <div className="um-stat-icon um-stat-icon--neon" style={{ color: stat.color }}>

                <Icon size={16} strokeWidth={2.2} />

              </div>

            </div>

            <div className="um-stat-meta">

              <span

                className={`um-stat-delta ${

                  stat.change.startsWith('-') ? 'um-stat-delta--down' : 'um-stat-delta--up'

                }`}

              >

                {stat.change.startsWith('-') ? <ArrowDownRight size={11} /> : <ArrowUpRight size={11} />}

                {stat.change}

              </span>

              <span className="um-stat-detail">{stat.detail}</span>

            </div>

          </div>

        );

      })}

    </div>

  );

}

