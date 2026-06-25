import React, { useState } from 'react';
import FooterPageShell from '../components/FooterPageShell';
import PageHero from '../components/PageHero';
import { FAQ_ITEMS, HELP_CATEGORIES } from '../data/helpCenterData';

export default function HelpCenter() {
  const [search, setSearch] = useState('');

  return (
    <FooterPageShell variant="resources">
      <section className="fp-card" style={{ textAlign: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 26, color: '#f8fafc' }}>How can we help you?</h1>
        <input
          className="fp-search"
          type="search"
          placeholder="Search help articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search help center"
          style={{ maxWidth: 480, margin: '0 auto' }}
        />
      </section>
      <div className="fp-grid-3" style={{ marginBottom: 16 }}>
        {HELP_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className="fp-card"
            style={{ cursor: 'pointer', textAlign: 'center', border: '1px solid rgba(148,163,184,0.14)' }}
          >
            <span style={{ fontSize: 28 }}>{cat.icon}</span>
            <p style={{ margin: '10px 0 0', fontWeight: 700, color: '#e2e8f0' }}>{cat.label}</p>
          </button>
        ))}
      </div>
      <section className="fp-card">
        <h2 style={{ marginTop: 0, color: '#f8fafc' }}>Frequently Asked Questions</h2>
        {FAQ_ITEMS.filter((f) => !search || f.q.toLowerCase().includes(search.toLowerCase())).map((item) => (
          <details key={item.q} className="fp-faq-item" open={!!search}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>
    </FooterPageShell>
  );
}
