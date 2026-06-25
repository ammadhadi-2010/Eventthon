import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiGlobe, FiExternalLink } from 'react-icons/fi';

function resolveHubPath(pathname, hubPath) {
  if (hubPath) return hubPath;
  if (pathname.startsWith('/gigs')) return '/gigs/showrooms';
  if (pathname.startsWith('/jobs')) return '/jobs/showrooms';
  return '/projects/showrooms';
}

export default function ShowroomPanelsNavItem({ className = 'ph-left-link', hubPath, variant = 'default' }) {
  const location = useLocation();
  const target = resolveHubPath(location.pathname, hubPath);
  const active =
    location.pathname.startsWith('/showrooms') ||
    location.pathname.endsWith('/showrooms');

  if (variant === 'premium') {
    return (
      <Link
        to={target}
        className={`ph-showroom-premium${active ? ' is-active' : ''}`}
        aria-current={active ? 'page' : undefined}
      >
        <span className="ph-showroom-premium__glow" aria-hidden />
        <span className="ph-showroom-premium__icon" aria-hidden>
          <FiGlobe size={18} />
        </span>
        <span className="ph-showroom-premium__copy">
          <strong>Public Showrooms</strong>
          <small>Live portfolio previews</small>
        </span>
        <span className="ph-showroom-premium__tail" aria-hidden>
          <FiExternalLink size={13} />
          <FiChevronRight size={15} />
        </span>
      </Link>
    );
  }

  return (
    <Link to={target} className={`${className} sph-nav-link${active ? ' is-active' : ''}`}>
      <FiGlobe size={14} aria-hidden />
      <span>Public Showrooms</span>
    </Link>
  );
}
