import React from 'react';
import FooterPageShell from '../components/FooterPageShell';
import PageHero from '../components/PageHero';
import { TEAM, TIMELINE } from '../data/aboutData';

export default function AboutUs() {
  return (
    <FooterPageShell variant="company">
      <PageHero title="About Us" subtitle="The story behind EventThon and the team building the elite creator network." />
      <section className="fp-card">
        <h2 className="fp-section-title">Our journey</h2>
        {TIMELINE.map((step) => (
          <div key={step.year} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <span className="fp-tag" style={{ minWidth: 52 }}>{step.year}</span>
            <div>
              <strong style={{ color: '#f1f5f9' }}>{step.title}</strong>
              <p style={{ margin: '4px 0 0', color: '#cbd5e1', fontSize: 13 }}>{step.text}</p>
            </div>
          </div>
        ))}
      </section>
      <section className="fp-card">
        <h2 className="fp-section-title">Leadership team</h2>
        <div className="fp-grid-2">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="fp-card"
              style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(99,102,241,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'grid', placeItems: 'center', fontWeight: 800, marginBottom: 10 }}>{member.initials}</div>
              <strong style={{ color: '#f8fafc' }}>{member.name}</strong>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#cbd5e1' }}>{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </FooterPageShell>
  );
}
