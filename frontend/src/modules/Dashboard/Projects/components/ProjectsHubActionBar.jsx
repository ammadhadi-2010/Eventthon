import React from 'react';
import { Link } from 'react-router-dom';
import { FiBarChart2, FiPlus } from 'react-icons/fi';

export default function ProjectsHubActionBar({
  onViewAnalytics,
  onNewProject,
}) {
  return (
    <div className="ph-hero-actions-bar">
      <Link to="/projects/showrooms" className="ph-hero-action-btn ph-hero-action-btn--showroom">
        Public Showroom
      </Link>
      <button type="button" className="ph-hero-action-btn ph-hero-action-btn--analytics" onClick={onViewAnalytics}>
        <FiBarChart2 size={13} aria-hidden />
        <span>View Analytics</span>
      </button>
      <button type="button" className="ph-hero-action-btn ph-hero-action-btn--new" onClick={onNewProject}>
        <FiPlus size={13} aria-hidden />
        <span>+ Project</span>
      </button>
    </div>
  );
}
