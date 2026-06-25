import React, { useCallback, useState } from 'react';
import FooterPageHeader from './FooterPageHeader';

export default function LegalDocLayout({ title, sections }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const activeIndex = Math.max(0, sections.findIndex((s) => s.id === activeId));
  const active = sections[activeIndex] || sections[0];

  const onSectionStep = useCallback(
    (delta) => {
      const next = Math.min(sections.length - 1, Math.max(0, activeIndex + delta));
      setActiveId(sections[next]?.id);
    },
    [activeIndex, sections],
  );

  return (
    <>
      <FooterPageHeader
        title={title}
        sectionIds={sections.map((s) => s.id)}
        activeSectionIndex={activeIndex}
        onSectionStep={onSectionStep}
      />
      <div className="fp-hero-sub fp-legal-updated">
        <p>Last updated: May 24, 2026</p>
      </div>
      <div className="fp-hub-row fp-inner-split" style={{ gap: 16 }}>
        <nav className="fp-card fp-inner-nav">
          <ul className="fp-nav-list">
            {sections.map((sec) => (
              <li key={sec.id}>
                <button
                  type="button"
                  className={activeId === sec.id ? 'is-active' : ''}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    border: 0,
                    background: activeId === sec.id ? 'rgba(99,102,241,0.18)' : 'transparent',
                    color: activeId === sec.id ? '#e9d5ff' : '#cbd5e1',
                    padding: '10px 12px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                  onClick={() => setActiveId(sec.id)}
                >
                  {sec.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <article className="fp-card fp-inner-main">
          <h2 className="fp-section-title">{active.label}</h2>
          {active.paragraphs.map((p) => (
            <p key={p.slice(0, 24)} className="fp-body-text">
              {p}
            </p>
          ))}
        </article>
      </div>
    </>
  );
}
