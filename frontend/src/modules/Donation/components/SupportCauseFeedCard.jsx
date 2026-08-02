import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';

export default function SupportCauseFeedCard({
  title = 'Support a Cause',
  subtitle = 'Donate to verified organizations through EventThon.',
}) {
  return (
    <section className="support-cause-card" aria-label="Support a cause">
      <div className="support-cause-card__glow" aria-hidden />
      <div className="support-cause-card__copy">
        <span className="support-cause-card__eyebrow">Give back</span>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <Link to="/donate" className="support-cause-card__cta">
        <FiHeart size={14} aria-hidden /> Donate Now
      </Link>
    </section>
  );
}
