import React from 'react';
import { Link } from 'react-router-dom';
import { BusinessIcon } from '../../../../components/lottie';

export default function SidebarSection({ title, viewAllTo, children, className = '', titleLottie, titleIconLabel }) {
  return (
    <section className={`dash-rs-card ${className}`.trim()}>
      <header className="dash-rs-head">
        <h4 className="dash-rs-title dash-rs-title--with-icon">
          {titleLottie ? (
            <BusinessIcon
              src={titleLottie}
              size={22}
              label={titleIconLabel || `${title} section icon`}
            />
          ) : null}
          <span>{title}</span>
        </h4>
        {viewAllTo ? (
          <Link to={viewAllTo} className="dash-rs-view-all">
            View All
          </Link>
        ) : null}
      </header>
      {children}
    </section>
  );
}
