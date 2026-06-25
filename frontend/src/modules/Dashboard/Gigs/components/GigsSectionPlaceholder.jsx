import React from 'react';
import { GigsHubSectionHeader } from './GigsHubBackButton';

export default function GigsSectionPlaceholder({ title, subtitle, onBack }) {
  return (
    <section className="gigs-main-stack">
      <div className="gigs-card gigs-section-placeholder-card">
        <GigsHubSectionHeader title={title} subtitle={subtitle} onBack={onBack} />
        <p className="ghub-section-placeholder">More tools for this area are on the way.</p>
      </div>
    </section>
  );
}
