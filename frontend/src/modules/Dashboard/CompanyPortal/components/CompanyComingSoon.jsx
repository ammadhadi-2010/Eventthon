import React from 'react';
import { Link } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';

export default function CompanyComingSoon({ title, description }) {
  return (
    <section className="cp-coming-soon gigs-card">
      <div className="cp-coming-soon__icon" aria-hidden>
        <FiLock size={22} />
      </div>
      <h2>{title}</h2>
      <p>{description || 'This company hub feature is coming soon. Your core hiring dashboard remains fully active.'}</p>
      <span className="cp-coming-soon__badge">Coming Soon</span>
      <Link to="/company/dashboard" className="cp-coming-soon__back">
        Back to Company Dashboard
      </Link>
    </section>
  );
}
