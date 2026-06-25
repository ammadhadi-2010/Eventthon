import React from 'react';
import FooterPageShell from '../components/FooterPageShell';
import PageHero from '../components/PageHero';
import { GUIDES } from '../data/guidesData';

export default function Guides() {
  return (
    <FooterPageShell variant="resources">
      <PageHero title="Guides" subtitle="Step-by-step strategic handbooks for squads, gigs, and projects." />
      <div className="fp-grid-2">
        {GUIDES.map((guide) => (
          <article key={guide.id} className="fp-card">
            <span className="fp-tag">{guide.level}</span>
            <h3 style={{ margin: '10px 0 8px', color: '#f8fafc' }}>{guide.title}</h3>
            <p style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b' }}>{guide.time} read</p>
            <div style={{ height: 6, borderRadius: 999, background: 'rgba(148,163,184,0.15)' }}>
              <div
                style={{
                  width: `${guide.progress}%`,
                  height: '100%',
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                }}
              />
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 11, color: '#94a3b8' }}>{guide.progress}% complete</p>
          </article>
        ))}
      </div>
    </FooterPageShell>
  );
}
