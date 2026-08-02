import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

/** Clickable trail: Home → Jobs → current page (desktop + mobile). */
export default function JobsBreadcrumb({ items = [], className = '' }) {
  if (!items.length) return null;

  return (
    <nav className={`jh-breadcrumb ${className}`.trim()} aria-label="Breadcrumb">
      <ol className="jh-breadcrumb__list">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="jh-breadcrumb__item">
              {index > 0 ? (
                <FiChevronRight size={12} className="jh-breadcrumb__sep" aria-hidden />
              ) : null}
              {last || !item.to ? (
                <span className="jh-breadcrumb__current" aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="jh-breadcrumb__link">
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
