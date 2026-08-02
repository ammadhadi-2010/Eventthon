import React from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiGlobe, FiZap } from 'react-icons/fi';

export default function JobsBrowseMobileActionStrip() {
  return (
    <div className="jobs-mobile-action-strip" role="toolbar" aria-label="Jobs quick actions">
      <Link
        to="/jobs/opportunities/new"
        className="jobs-mobile-action-strip__btn jobs-mobile-action-strip__btn--create"
      >
        <FiZap size={15} aria-hidden />
        Opportunity
      </Link>
      <Link
        to="/jobs/alerts/new"
        className="jobs-mobile-action-strip__btn jobs-mobile-action-strip__btn--alert"
      >
        <FiBell size={15} aria-hidden />
        Job Alert
      </Link>
      <Link
        to="/jobs/showrooms"
        className="jobs-mobile-action-strip__btn jobs-mobile-action-strip__btn--showroom"
      >
        <FiGlobe size={15} aria-hidden />
        Public Showroom
      </Link>
    </div>
  );
}
