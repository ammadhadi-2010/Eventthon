import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

/** Clickable trail: Home → Projects → current page. */
export default function ProjectsBreadcrumb({ items = [], className = '' }) {
  if (!items.length) return null;

  return (
    <nav className={`ph-breadcrumb ${className}`.trim()} aria-label="Breadcrumb">
      <ol className="ph-breadcrumb__list">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="ph-breadcrumb__item">
              {index > 0 ? (
                <FiChevronRight size={12} className="ph-breadcrumb__sep" aria-hidden />
              ) : null}
              {last || !item.to ? (
                <span className="ph-breadcrumb__current" aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="ph-breadcrumb__link">
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
