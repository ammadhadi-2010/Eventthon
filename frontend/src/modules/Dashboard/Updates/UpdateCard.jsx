import React, { useState } from 'react';
import { FiAward, FiBriefcase } from 'react-icons/fi';

function SquareMedia({ imageurl, label }) {
  const [broken, setBroken] = useState(false);
  if (imageurl && !broken) {
    return <img src={imageurl} alt="" className="upd-card__media-img" onError={() => setBroken(true)} loading="lazy" />;
  }
  return <div className="upd-card__media-fallback">{label.slice(0, 2)}</div>;
}

function RoundMedia({ imageurl, label }) {
  const [broken, setBroken] = useState(false);
  if (imageurl && !broken) {
    return <img src={imageurl} alt="" className="upd-card__media-round" onError={() => setBroken(true)} loading="lazy" />;
  }
  return <div className="upd-card__media-round upd-card__media-round--fallback">{label.charAt(0)}</div>;
}

function BadgeMedia() {
  return (
    <div className="upd-card__badge-wrap" aria-hidden>
      <FiAward className="upd-card__badge-icon" />
    </div>
  );
}

function JobMedia() {
  return (
    <div className="upd-card__job-wrap" aria-hidden>
      <FiBriefcase className="upd-card__job-icon" />
    </div>
  );
}

export default function UpdateCard({ item }) {
  const { theme, title, message, imageurl, timeAgo } = item;
  const layout = theme.layout;

  return (
    <article className="upd-card" style={{ borderColor: theme.color, boxShadow: `0 0 0 1px ${theme.glow}` }}>
      <header className="upd-card__head" style={{ color: theme.color }}>
        <span className="upd-card__dot" style={{ background: theme.color }} />
        <span>{theme.label}</span>
      </header>
      <div className="upd-card__media">
        {layout === 'square' ? <SquareMedia imageurl={imageurl} label={title} /> : null}
        {layout === 'round' ? <RoundMedia imageurl={imageurl} label={title} /> : null}
        {layout === 'badge' ? <BadgeMedia /> : null}
        {layout === 'icon' ? <JobMedia /> : null}
      </div>
      <h3 className="upd-card__title">{title}</h3>
      {message ? <p className="upd-card__message">{message}</p> : null}
      <footer className="upd-card__time">{timeAgo}</footer>
    </article>
  );
}
