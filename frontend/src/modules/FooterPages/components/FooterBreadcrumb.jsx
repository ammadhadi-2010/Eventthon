import React from 'react';
import { Link } from 'react-router-dom';

function scrollToHash(hash) {
  const id = String(hash || '').replace(/^#/, '');
  if (!id) return;
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Clickable footer-page breadcrumb trail. Last item = current page (no link). */
export default function FooterBreadcrumb({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav className="fp-crumb" aria-label="Breadcrumb">
      <ol className="fp-crumb__list">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          const key = `${item.label}-${index}`;
          const isHash = String(item.to || '').startsWith('#');

          return (
            <li key={key} className="fp-crumb__item">
              {index > 0 ? <span className="fp-crumb__sep" aria-hidden>/</span> : null}
              {last || !item.to ? (
                <span className="fp-crumb__current" aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : isHash ? (
                <a
                  href={item.to}
                  className="fp-crumb__link"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToHash(item.to);
                  }}
                >
                  {item.label}
                </a>
              ) : (
                <Link to={item.to} className="fp-crumb__link">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
