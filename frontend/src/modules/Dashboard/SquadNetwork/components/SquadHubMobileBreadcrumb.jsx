import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import '../styles/squad-hub-mobile-breadcrumb.css';

export default function SquadHubMobileBreadcrumb({ squadName = '', activeTab = '' }) {
  const tabLabel = activeTab && activeTab !== 'Overview' ? activeTab : '';

  return (
    <nav className="sq-hub-breadcrumb" aria-label="Breadcrumb">
      <Link to="/dashboard" className="sq-hub-breadcrumb__link">
        Home
      </Link>
      <FiChevronRight size={12} className="sq-hub-breadcrumb__sep" aria-hidden />
      <Link to="/squads" className="sq-hub-breadcrumb__link">
        Squads
      </Link>
      {squadName ? (
        <>
          <FiChevronRight size={12} className="sq-hub-breadcrumb__sep" aria-hidden />
          <span className="sq-hub-breadcrumb__current" aria-current="page">
            {squadName}
          </span>
        </>
      ) : null}
      {tabLabel ? (
        <>
          <FiChevronRight size={12} className="sq-hub-breadcrumb__sep" aria-hidden />
          <span className="sq-hub-breadcrumb__tab">{tabLabel}</span>
        </>
      ) : null}
    </nav>
  );
}
