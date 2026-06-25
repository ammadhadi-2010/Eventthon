import React from 'react';
import { FiClock } from 'react-icons/fi';
import { getJobMenuItem } from '../data/jobsMenuData';

export default function JobsComingSoon({ sectionId }) {
  const item = getJobMenuItem(sectionId);
  const title = item?.label || 'This feature';

  return (
    <section className="jh-view jh-view--coming-soon">
      <div className="gigs-card jh-coming-soon">
        <span className="jh-coming-soon__icon" aria-hidden>
          <FiClock size={28} />
        </span>
        <h2>{title}</h2>
        <p className="jh-coming-soon__badge">Coming Soon</p>
        <p className="jh-coming-soon__copy">
          We are building this experience. Check back soon for updates.
        </p>
      </div>
    </section>
  );
}
