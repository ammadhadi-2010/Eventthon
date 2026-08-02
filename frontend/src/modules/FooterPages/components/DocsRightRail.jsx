import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiHeart, FiThumbsDown, FiThumbsUp } from 'react-icons/fi';
import { DOC_RESOURCES, DOC_TOC } from '../data/documentationData';

export default function DocsRightRail({ activeTocId, onTocClick, showToc = true }) {
  return (
    <div className="docs-rail">
      {showToc ? (
        <section className="docs-rail__card">
          <p className="docs-rail__title">On this page</p>
          <ul className="docs-rail__toc">
            {DOC_TOC.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={activeTocId === item.id ? 'is-active' : ''}
                  onClick={() => onTocClick(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="docs-rail__card docs-rail__feedback">
        <p className="docs-rail__title">Was this helpful?</p>
        <div className="docs-rail__yesno">
          <button type="button" className="is-yes" aria-label="Yes"><FiThumbsUp size={14} /></button>
          <button type="button" className="is-no" aria-label="No"><FiThumbsDown size={14} /></button>
        </div>
      </section>

      <section className="docs-rail__card">
        <p className="docs-rail__title">Resources</p>
        <ul className="docs-rail__links">
          {DOC_RESOURCES.map((item) => (
            <li key={item.to}>
              <Link to={item.to}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="docs-rail__card docs-rail__donate">
        <p className="docs-rail__title"><FiHeart size={13} aria-hidden /> Love EventThon?</p>
        <Link to="/donate" className="docs-rail__cta">Donate Now</Link>
      </section>

      <section className="docs-rail__card">
        <p className="docs-rail__title">Found a bug?</p>
        <Link to="/company/contact" className="docs-rail__cta docs-rail__cta--ghost">Report a Bug</Link>
      </section>

      <p className="docs-rail__tip"><FiCheck size={12} aria-hidden /> Tip: use logo drawer on mobile for topics.</p>
    </div>
  );
}
