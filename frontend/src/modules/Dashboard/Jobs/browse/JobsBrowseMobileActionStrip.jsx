import React from 'react';
import { Link } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';

export default function JobsBrowseMobileActionStrip({ onOpenLeftDrawer }) {
  return (
    <div className="jobs-mobile-action-strip" role="toolbar" aria-label="Jobs quick actions">
      <button
        type="button"
        className="jobs-mobile-action-strip__btn jobs-mobile-action-strip__btn--menu"
        aria-label="Open jobs menu"
        onClick={onOpenLeftDrawer}
      >
        <FiMenu size={15} aria-hidden />
        Menu
      </button>
      <Link
        to="/jobs/alerts/new"
        className="jobs-mobile-action-strip__btn jobs-mobile-action-strip__btn--create"
      >
        + Create Job Alert
      </Link>
      <Link
        to="/jobs/showrooms"
        className="jobs-mobile-action-strip__btn jobs-mobile-action-strip__btn--showroom"
      >
        Public Showrooms
      </Link>
    </div>
  );
}
