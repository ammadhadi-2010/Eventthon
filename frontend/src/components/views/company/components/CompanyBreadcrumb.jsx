import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import '../styles/company-breadcrumb.css';

/** Home → Company Hub → optional page */
export default function CompanyBreadcrumb({ items = [], className = '' }) {
  if (!items.length) return null;

  return (
    <nav className={`cp-breadcrumb ${className}`.trim()} aria-label="Breadcrumb">
      <ol className="cp-breadcrumb__list">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="cp-breadcrumb__item">
              {index > 0 ? (
                <FiChevronRight size={12} className="cp-breadcrumb__sep" aria-hidden />
              ) : null}
              {last || !item.to ? (
                <span className="cp-breadcrumb__current" aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="cp-breadcrumb__link">
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

export function companyHubCrumbs(pageLabel = 'Overview') {
  return [
    { label: 'Home', to: '/dashboard' },
    { label: 'Company Hub', to: '/company/dashboard' },
    { label: pageLabel },
  ];
}
