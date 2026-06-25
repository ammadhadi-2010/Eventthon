import React from 'react';
import FooterPageShell from '../components/FooterPageShell';
import PageHero from '../components/PageHero';
import { CASE_STUDIES } from '../data/caseStudiesData';

export default function CaseStudies() {
  return (
    <FooterPageShell variant="resources">
      <PageHero title="Case Studies" subtitle="Enterprise outcomes powered by EventThon modules." />
      <div className="fp-grid-3">
        {CASE_STUDIES.map((story) => (
          <article key={story.id} className="fp-card" style={{ textAlign: 'center' }}>
            <p className="fp-metric">{story.metric}</p>
            <p style={{ margin: '0 0 8px', fontWeight: 800, color: '#c4b5fd' }}>{story.label}</p>
            <h3 style={{ margin: '0 0 8px', color: '#f8fafc' }}>{story.client}</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{story.summary}</p>
          </article>
        ))}
      </div>
    </FooterPageShell>
  );
}
