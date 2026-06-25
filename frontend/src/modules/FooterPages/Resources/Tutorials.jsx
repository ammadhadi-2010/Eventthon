import React from 'react';
import { FiPlay } from 'react-icons/fi';
import FooterPageShell from '../components/FooterPageShell';
import PageHero from '../components/PageHero';
import { TUTORIALS } from '../data/tutorialsData';

export default function Tutorials() {
  return (
    <FooterPageShell variant="resources">
      <PageHero title="Tutorials" subtitle="Video and interactive lessons for mastering EventThon workflows." />
      <div className="fp-grid-3">
        {TUTORIALS.map((item) => (
          <article key={item.id} className="fp-card">
            <div
              style={{
                height: 140,
                borderRadius: 12,
                background: 'linear-gradient(145deg, rgba(79,70,229,0.4), rgba(15,23,42,0.9))',
                display: 'grid',
                placeItems: 'center',
                position: 'relative',
                marginBottom: 12,
              }}
            >
              <button
                type="button"
                aria-label={`Play ${item.title}`}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: 0,
                  background: 'rgba(255,255,255,0.9)',
                  color: '#4f46e5',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <FiPlay size={20} />
              </button>
              <span className="fp-tag" style={{ position: 'absolute', bottom: 10, right: 10 }}>{item.duration}</span>
            </div>
            <h3 style={{ margin: '0 0 10px', fontSize: 15, color: '#f8fafc' }}>{item.title}</h3>
            <ul style={{ margin: 0, paddingLeft: 18, color: '#94a3b8', fontSize: 12 }}>
              {item.tasks.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </FooterPageShell>
  );
}
