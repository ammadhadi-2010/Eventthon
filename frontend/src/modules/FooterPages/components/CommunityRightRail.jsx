import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiAward, FiBookOpen, FiCheckCircle, FiFlag, FiHeart,
  FiHeadphones, FiShield, FiUsers,
} from 'react-icons/fi';
import { resolveCommunityAvatar } from '../utils/communityAvatar';

const HIGHLIGHT_ICONS = {
  heart: FiHeart,
  check: FiCheckCircle,
  shield: FiShield,
  flag: FiFlag,
};

export default function CommunityRightRail({ members = [], highlights = [] }) {
  return (
    <aside className="comm-rail" aria-label="Community sidebar">
      <section className="comm-rail__card">
        <p className="comm-rail__title">Top Community Members</p>
        <ul className="comm-members">
          {members.map((m, index) => {
            const src = resolveCommunityAvatar(m.avatar || m, m.name || m.initial || `m-${index}`);
            return (
              <li key={m.id}>
                <img
                  className={`comm-members__avatar tone-${(index % 5) + 1}`}
                  src={src}
                  alt=""
                />
                <span className="comm-members__meta">
                  <strong>
                    {m.medal ? <span className={`comm-medal comm-medal--${m.medal}`} aria-hidden /> : null}
                    {m.name}
                  </strong>
                  <em>{m.role}</em>
                </span>
                <span className="comm-members__pts">{Number(m.points || 0).toLocaleString()} pts</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="comm-rail__card comm-rail__squad">
        <div>
          <p className="comm-rail__title">Start a Squad</p>
          <p className="comm-rail__text">Build with teammates and ship faster together.</p>
          <Link to="/squads" className="comm-btn-primary comm-btn-primary--sm">
            Create Squad →
          </Link>
        </div>
        <span className="comm-rail__squad-art" aria-hidden>
          <FiUsers size={28} />
        </span>
      </section>

      <section className="comm-rail__card">
        <p className="comm-rail__title">Community Highlights</p>
        <ul className="comm-highlights">
          {highlights.map((item) => {
            const Icon = HIGHLIGHT_ICONS[item.icon] || FiAward;
            return (
              <li key={item.id}>
                <span aria-hidden><Icon size={14} /></span>
                {item.label}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="comm-rail__card">
        <p className="comm-rail__title">Need Help?</p>
        <div className="comm-rail__help">
          <Link to="/company/contact" className="is-primary">
            <FiHeadphones size={14} aria-hidden /> Contact Support
          </Link>
          <Link to="/resources/help">Help Center</Link>
          <Link to="/resources/guides">
            <FiBookOpen size={14} aria-hidden /> Community Guides
          </Link>
        </div>
      </section>
    </aside>
  );
}
