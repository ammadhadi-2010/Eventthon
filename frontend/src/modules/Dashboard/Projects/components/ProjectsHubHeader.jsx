import React from 'react';
import { FiBarChart2, FiFilter, FiSearch } from 'react-icons/fi';
import ProjectsHubActionBar from './ProjectsHubActionBar';

export default function ProjectsHubHeader({
  searchQuery,
  onSearchChange,
  onViewAnalytics,
  activeMenu,
  onMenuSelect,
  onNewProject,
  menuCounts,
}) {
  return (
    <>
      <header className="ph-hero">
        <div>
          <h1 className="ph-hero-title ph-mobile-section-title">Projects Hub</h1>
          <p className="ph-hero-sub">Build, collaborate, and deliver amazing projects with your squad.</p>
        </div>
        <div className="ph-hero-actions">
          <ProjectsHubActionBar
            activeMenu={activeMenu}
            onMenuSelect={onMenuSelect}
            onViewAnalytics={onViewAnalytics}
            onNewProject={onNewProject}
            menuCounts={menuCounts}
          />
          <button type="button" className="ph-btn ph-btn--analytics ph-btn--desktop-only" onClick={onViewAnalytics}>
            <FiBarChart2 size={16} aria-hidden />
            View Analytics
          </button>
        </div>
      </header>
      <div className="ph-toolbar ph-toolbar--body-search">
        <div className="ph-search">
          <FiSearch size={16} className="ph-search-ico" aria-hidden />
          <input
            type="search"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search projects"
          />
        </div>
        <button type="button" className="ph-btn ph-btn--ghost">
          <FiFilter size={14} aria-hidden />
          Filters
        </button>
        <label className="ph-sort">
          <span>Sort by:</span>
          <select defaultValue="newest" aria-label="Sort projects">
            <option value="newest">Newest</option>
            <option value="deadline">Deadline</option>
            <option value="budget">Budget</option>
          </select>
        </label>
      </div>
    </>
  );
}
