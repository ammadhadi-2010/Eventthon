import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiUsers } from 'react-icons/fi';
import { resolveMediaUrl } from '../../../components/shared/utils/resolveMediaUrl';

function TeamAvatar({ member }) {
  const [broken, setBroken] = React.useState(false);
  const src = member.avatarUrl ? resolveMediaUrl(member.avatarUrl) : '';

  if (src && !broken) {
    return (
      <img
        src={src}
        alt=""
        className="about-feed-card__avatar-img"
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <span className="about-feed-card__avatar-fallback" style={{ background: member.accent }}>
      {member.initials}
    </span>
  );
}

export default function AboutLeadershipFeedCard({ team = [] }) {
  const preview = (Array.isArray(team) ? team : []).filter((m) => m.name).slice(0, 4);
  if (!preview.length) return null;

  return (
    <section className="about-feed-card about-feed-card--team" aria-label="Leadership team">
      <div className="about-feed-card__glow about-feed-card__glow--team" aria-hidden />
      <div className="about-feed-card__head">
        <span className="about-feed-card__eyebrow">Leadership team</span>
        <h3>Meet the people behind EventThon</h3>
      </div>
      <div className="about-feed-card__team-grid">
        {preview.map((member) => (
          <article key={member.name} className="about-feed-card__team-card">
            <TeamAvatar member={member} />
            <div>
              <strong>{member.name}</strong>
              <span>{member.role}</span>
              {member.bio ? <p>{member.bio}</p> : null}
            </div>
          </article>
        ))}
      </div>
      <Link to="/company/about" className="about-feed-card__cta about-feed-card__cta--team">
        <FiUsers size={14} aria-hidden /> View full team <FiArrowRight size={14} aria-hidden />
      </Link>
    </section>
  );
}
