import React, { useCallback, useState } from 'react';
import FooterPageShell from '../components/FooterPageShell';
import PageHero from '../components/PageHero';
import CodeSnippetBox from '../components/CodeSnippetBox';
import { DOC_NAV, DOC_SNIPPETS } from '../data/documentationData';

export default function Documentation() {
  const [section, setSection] = useState('start');
  const [query, setQuery] = useState('');
  const snippet = DOC_SNIPPETS[section];
  const sectionIndex = Math.max(0, DOC_NAV.findIndex((n) => n.id === section));

  const onSectionStep = useCallback((delta) => {
    const next = Math.min(DOC_NAV.length - 1, Math.max(0, sectionIndex + delta));
    setSection(DOC_NAV[next].id);
  }, [sectionIndex]);

  return (
    <FooterPageShell variant="resources">
      <PageHero
        title="Documentation"
        subtitle="Technical guides for integrating with EventThon APIs and SDKs."
        sectionIds={DOC_NAV.map((n) => n.id)}
        activeSectionIndex={sectionIndex}
        onSectionStep={onSectionStep}
      />
      <div className="fp-hub-row fp-inner-split">
        <nav className="fp-card fp-inner-nav">
          <p className="fp-tag" style={{ marginBottom: 10 }}>On this page</p>
          <ul className="fp-nav-list">
            {DOC_NAV.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={section === item.id ? 'is-active' : ''}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    border: 0,
                    background: section === item.id ? 'rgba(99,102,241,0.18)' : 'transparent',
                    color: section === item.id ? '#e9d5ff' : '#cbd5e1',
                    padding: '10px 12px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                  onClick={() => setSection(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="fp-inner-main">
          <div className="fp-card">
            <input
              className="fp-search"
              type="search"
              placeholder="Search docs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search documentation"
            />
            <h2 className="fp-section-title">{DOC_NAV.find((n) => n.id === section)?.label}</h2>
            <p className="fp-prose">
              {query ? `Showing results for "${query}" in ${section} documentation.` : 'Reference material and copy-ready samples for your integration.'}
            </p>
            <CodeSnippetBox code={snippet.code} title={snippet.title} />
          </div>
        </div>
      </div>
    </FooterPageShell>
  );
}
