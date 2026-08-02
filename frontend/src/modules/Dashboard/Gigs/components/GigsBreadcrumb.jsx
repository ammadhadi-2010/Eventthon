import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

/** Clickable trail: Home → Gigs → current page. */
export default function GigsBreadcrumb({ items = [], className = '' }) {
  if (!items.length) return null;

  return (
    <nav className={`gh-breadcrumb ${className}`.trim()} aria-label="Breadcrumb">
      <ol className="gh-breadcrumb__list">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="gh-breadcrumb__item">
              {index > 0 ? (
                <FiChevronRight size={12} className="gh-breadcrumb__sep" aria-hidden />
              ) : null}
              {last || !item.to ? (
                <span className="gh-breadcrumb__current" aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="gh-breadcrumb__link">
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
