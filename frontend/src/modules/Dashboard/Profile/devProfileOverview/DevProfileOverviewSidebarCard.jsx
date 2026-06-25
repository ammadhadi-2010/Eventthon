import React from 'react';
import { Link } from 'react-router-dom';

export default function DevProfileOverviewSidebarCard({ title, onViewAll, viewAllTo }) {
  return (
    <div className="dpo-scard-head">
      <h2 className="dpo-scard-title">{title}</h2>
      {viewAllTo ? (
        <Link to={viewAllTo} className="dpo-scard-viewall">
          View All
        </Link>
      ) : (
        <button type="button" className="dpo-scard-viewall" onClick={onViewAll}>
          View All
        </button>
      )}
    </div>
  );
}
