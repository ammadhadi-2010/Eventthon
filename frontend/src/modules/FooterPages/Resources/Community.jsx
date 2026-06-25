import React from 'react';
import { FaDiscord } from 'react-icons/fa6';
import FooterPageShell from '../components/FooterPageShell';
import PageHero from '../components/PageHero';
import { EVENT_COUNTDOWN, LEADERBOARD, THREADS } from '../data/communityData';

export default function Community() {
  return (
    <FooterPageShell variant="resources">
      <PageHero title="Community" subtitle="Forums, leaderboards, and live events for EventThon creators." />
      <div className="fp-grid-2">
        <section className="fp-card">
          <h2 style={{ marginTop: 0, color: '#f8fafc' }}>Leaderboard</h2>
          {LEADERBOARD.map((row) => (
            <div key={row.rank} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
              <span style={{ color: '#cbd5e1' }}>#{row.rank} {row.name}</span>
              <strong style={{ color: '#a78bfa' }}>{row.points} pts</strong>
            </div>
          ))}
        </section>
        <section className="fp-card">
          <h2 style={{ marginTop: 0, color: '#f8fafc' }}>{EVENT_COUNTDOWN.label}</h2>
          <p className="fp-metric" style={{ fontSize: 28 }}>{EVENT_COUNTDOWN.days}d {EVENT_COUNTDOWN.hours}h</p>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>Until the next global community session.</p>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 14,
              padding: '12px 18px',
              borderRadius: 12,
              background: '#5865F2',
              color: '#fff',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: 13,
            }}
          >
            <FaDiscord size={16} /> Join Discord Server
          </a>
        </section>
      </div>
      <section className="fp-card">
        <h2 style={{ marginTop: 0, color: '#f8fafc' }}>Recent Threads</h2>
        {THREADS.map((thread) => (
          <div key={thread.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
            <strong style={{ color: '#f1f5f9' }}>{thread.title}</strong>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{thread.replies} replies · {thread.ago}</p>
          </div>
        ))}
      </section>
    </FooterPageShell>
  );
}
