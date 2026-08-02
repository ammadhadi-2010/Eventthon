import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

export default function AlertsBreadcrumb({ items = [], className = '' }) {
  if (!items.length) return null;

  return (
    <nav className={`ah-breadcrumb ${className}`.trim()} aria-label="Breadcrumb">
      <ol className="ah-breadcrumb__list">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="ah-breadcrumb__item">
              {index > 0 ? (
                <FiChevronRight size={12} className="ah-breadcrumb__sep" aria-hidden />
              ) : null}
              {last || !item.to ? (
                <span className="ah-breadcrumb__current" aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link to={item.to} className="ah-breadcrumb__link">
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
