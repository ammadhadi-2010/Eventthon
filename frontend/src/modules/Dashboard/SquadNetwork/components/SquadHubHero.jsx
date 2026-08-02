import React from 'react';
import {
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiCompass,
  FiEdit2,
  FiFolder,
  FiStar,
  FiUserPlus,
  FiZap,
} from 'react-icons/fi';
import SquadAvatar from './SquadAvatar';
import { memberAvatar } from './workspace/squadWorkspaceData';
import '../styles/squad-avatar.css';

function resolveLeader(squad, members = []) {
  const byId = members.find(
    (m) =>
      m?.id &&
      squad?.leader_id &&
      String(m.id) === String(squad.leader_id),
  );
  if (byId) return byId;
  const byRole = members.find((m) =>
    /founder|leader|admin/i.test(String(m?.role || '')),
  );
  if (byRole) return byRole;
  if (members[0]) return members[0];
  return {
    name: squad?.leader_name || 'Squad Leader',
    role: 'Founder',
    avatar: null,
    verified: true,
  };
}

function pickStat(squad, key, fallback) {
  const v = squad?.[key];
  if (v == null || v === '') return fallback;
  return v;
}

export default function SquadHubHero({
  squad,
  members = [],
  memberCount = 0,
  canInvite,
  canEdit,
  canExplore,
  onInvite,
  onEdit,
  onExplore,
  onHire,
  headerMenu,
  mobileBack,
  mobileListToggle,
  mobileToolbar,
}) {
  const leader = resolveLeader(squad, members);
  const rating = pickStat(squad, 'rating', 4.9);
  const reviewCount = pickStat(squad, 'reviews_count', 32);
  const completed = pickStat(squad, 'completed_projects', 18);
  const timesHired = pickStat(squad, 'times_hired', 12);
  const avgResponse = pickStat(squad, 'avg_response', '1.8 hrs');
  const startingFrom = pickStat(squad, 'starting_from', '$500 / Project');
  const languages = pickStat(squad, 'languages', 'English');
  const replyWithin = pickStat(squad, 'reply_within', '~ 2 Hours');
  const availability = pickStat(squad, 'availability', 'Available for Hire');
  const isVerified = squad?.verified !== false;
  const leaderTitle =
    leader?.title || leader?.role || 'Founder & AI Engineer';
  const leaderAvatar =
    leader?.avatar ||
    leader?.imageurl ||
    leader?.profile_image_url ||
    memberAvatar(leader?.name);

  const stats = [
    {
      key: 'rating',
      icon: <FiStar size={16} />,
      iconClass: 'sq-hub-hero__stat-icon--gold',
      value: rating,
      label: `${reviewCount} Reviews`,
      accent: 'gold',
    },
    {
      key: 'completed',
      icon: <FiFolder size={16} />,
      iconClass: 'sq-hub-hero__stat-icon--amber',
      value: completed,
      label: 'Completed Projects',
      accent: 'amber',
    },
    {
      key: 'hired',
      icon: <FiBriefcase size={16} />,
      iconClass: 'sq-hub-hero__stat-icon--rose',
      value: timesHired,
      label: 'Times Hired',
      accent: 'rose',
    },
    {
      key: 'response',
      icon: <FiClock size={16} />,
      iconClass: 'sq-hub-hero__stat-icon--slate',
      value: avgResponse,
      label: 'Avg Response',
      accent: 'slate',
    },
  ];

  return (
    <header className="sq-hub-hero">
      <div className="sq-hub-hero__top">
        <div className="sq-hub-hero__identity">
          {mobileBack}
          <SquadAvatar
            squad={squad}
            size="lg"
            showOnlineDot
            className="squad-hub__header-avatar sq-hub-hero__avatar"
          />
          <div className="sq-hub-hero__copy">
            <div className="sq-hub-hero__title-row">
              <h2 className="sq-hub-hero__name">{squad?.squad_name}</h2>
              <span className="sq-hub-hero__crown" aria-hidden>
                👑
              </span>
              {isVerified ? (
                <span className="sq-hub-hero__verified">
                  <FiCheckCircle size={13} aria-hidden />
                  Verified Squad
                </span>
              ) : null}
            </div>
            <p className="sq-hub-hero__meta">
              {squad?.niche || 'Squad'} • {memberCount} Members
            </p>
          </div>
          {mobileListToggle}
        </div>

        <div className="sq-hub-hero__aside">
          <div className="sq-hub-hero__actions squad-hub__header-actions--desktop">
            {canInvite ? (
              <button type="button" className="sq-hub-hero__btn" onClick={onInvite}>
                <FiUserPlus size={15} /> Invite
              </button>
            ) : null}
            {canEdit ? (
              <button type="button" className="sq-hub-hero__btn" onClick={onEdit}>
                <FiEdit2 size={15} /> Edit Squad
              </button>
            ) : null}
            <button
              type="button"
              className="sq-hub-hero__btn sq-hub-hero__btn--sm"
              onClick={onExplore}
              disabled={!canExplore}
              title={
                canExplore
                  ? 'Open public showroom'
                  : 'Enable Public listing in Settings to explore'
              }
            >
              <FiCompass size={13} /> Explore
            </button>
            <div className="sq-hub-hero__hire-row">
              <button type="button" className="sq-hub-hero__hire" onClick={onHire}>
                <FiZap size={15} aria-hidden /> Hire Squad
              </button>
              {headerMenu}
            </div>
          </div>

          <div className="sq-hub-hero__stats" aria-label="Squad performance stats">
            {stats.map((stat) => (
              <div
                key={stat.key}
                className={`sq-hub-hero__stat sq-hub-hero__stat--${stat.accent}`}
              >
                <span className={`sq-hub-hero__stat-icon ${stat.iconClass}`}>
                  {stat.icon}
                </span>
                <div>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {mobileToolbar}
      </div>

      <div className="sq-hub-hero__info-grid">
        <div className="sq-hub-hero__info-cell">
          <span className="sq-hub-hero__info-label">Squad Leader</span>
          <div className="sq-hub-hero__leader">
            <img src={leaderAvatar} alt="" className="sq-hub-hero__leader-avatar" />
            <div>
              <div className="sq-hub-hero__leader-name">
                {leader?.name || 'Leader'}
                {leader?.verified !== false ? (
                  <FiCheckCircle size={12} className="sq-hub-hero__tick" aria-hidden />
                ) : null}
              </div>
              <div className="sq-hub-hero__leader-role">{leaderTitle}</div>
            </div>
          </div>
        </div>
        <div className="sq-hub-hero__info-cell">
          <span className="sq-hub-hero__info-label">Availability</span>
          <div className="sq-hub-hero__avail">
            <span className="sq-hub-hero__avail-dot" aria-hidden />
            {availability}
          </div>
        </div>
        <div className="sq-hub-hero__info-cell">
          <span className="sq-hub-hero__info-label">Starting From</span>
          <strong className="sq-hub-hero__info-value">{startingFrom}</strong>
          <span className="sq-hub-hero__info-sub">Negotiable</span>
        </div>
        <div className="sq-hub-hero__info-cell">
          <span className="sq-hub-hero__info-label">Languages</span>
          <strong className="sq-hub-hero__info-value">{languages}</strong>
        </div>
        <div className="sq-hub-hero__info-cell sq-hub-hero__info-cell--reply">
          <span className="sq-hub-hero__info-label">Replies Within</span>
          <strong className="sq-hub-hero__info-value sq-hub-hero__info-value--accent">
            {replyWithin}
          </strong>
        </div>
      </div>
    </header>
  );
}
