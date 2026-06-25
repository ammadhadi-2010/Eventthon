import React from 'react';
import { Link } from 'react-router-dom';

export default function CompanyPortalPlaceholder({ title }) {
  return (
    <section className="cp-page-error gigs-card">
      <h2>{title}</h2>
      <p>This section is coming soon. Use the dashboard for live hiring metrics.</p>
      <Link to="/company/dashboard" className="cp-coming-soon__back">
        Back to Dashboard
      </Link>
    </section>
  );
}
