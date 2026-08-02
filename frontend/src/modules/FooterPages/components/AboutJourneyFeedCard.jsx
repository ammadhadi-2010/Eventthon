import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMapPin } from 'react-icons/fi';

export default function AboutJourneyFeedCard({ steps = [], subtitle = '' }) {
  const preview = (Array.isArray(steps) ? steps : []).filter((s) => s.year || s.title).slice(0, 3);
  if (!preview.length) return null;

  return (
    <section className="about-feed-card about-feed-card--journey" aria-label="Our journey">
      <div className="about-feed-card__glow" aria-hidden />
      <div className="about-feed-card__head">
        <span className="about-feed-card__eyebrow">Our journey</span>
        <h3>Building EventThon, step by step</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <ol className="about-feed-card__timeline">
        {preview.map((step) => (
          <li key={`${step.year}-${step.title}`}>
            <span className="about-feed-card__year">{step.year}</span>
            <div>
              <strong>{step.title}</strong>
              {step.text ? <span>{step.text}</span> : null}
            </div>
          </li>
        ))}
      </ol>
      <Link to="/company/about" className="about-feed-card__cta">
        <FiMapPin size={14} aria-hidden /> Read full story <FiArrowRight size={14} aria-hidden />
      </Link>
    </section>
  );
}
