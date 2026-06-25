import React, { useState } from 'react';
import FooterPageShell from '../components/FooterPageShell';
import PageHero from '../components/PageHero';
import { DEPARTMENTS, JOBS } from '../data/careersData';

export default function Careers() {
  const [dept, setDept] = useState('All');
  const filtered = dept === 'All' ? JOBS : JOBS.filter((j) => j.dept === dept);

  return (
    <FooterPageShell variant="company">
      <PageHero title="Careers" subtitle="Join EventThon and build the future of collaborative work." />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {DEPARTMENTS.map((d) => (
          <button
            key={d}
            type="button"
            className="fp-tag"
            style={{
              cursor: 'pointer',
              border: dept === d ? '1px solid #8b5cf6' : '1px solid transparent',
              background: dept === d ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.15)',
            }}
            onClick={() => setDept(d)}
          >
            {d}
          </button>
        ))}
      </div>
      {filtered.map((job) => (
        <article key={job.id} className="fp-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ margin: '0 0 4px', color: '#f8fafc' }}>{job.title}</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>{job.dept} · {job.location}</p>
          </div>
          <button
            type="button"
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: 0,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            onClick={() => window.alert(`Application flow for ${job.title} coming soon.`)}
          >
            Apply Now
          </button>
        </article>
      ))}
    </FooterPageShell>
  );
}
