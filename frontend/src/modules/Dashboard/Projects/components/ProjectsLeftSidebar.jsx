import React from 'react';
import { Link } from 'react-router-dom';
import { FiGrid, FiPlus } from 'react-icons/fi';
import { PROJECT_CATEGORIES, PROJECTS_MENU } from '../data/projectsHubData';
import ShowroomPanelsNavItem from '../../../Public/components/ShowroomPanelsNavItem';

const COUNT_KEYS = {
  'my-projects': 'my-projects',
  collaborations: 'collaborations',
  saved: 'saved',
  funding: 'funding',
  reviews: 'reviews',
};

export default function ProjectsLeftSidebar({ activeMenu, onMenuSelect, onNewProject, menuCounts = {} }) {
  return (
    <aside className="ph-card ph-left">
      <div className="ph-left-brand">
        <FiGrid size={16} aria-hidden />
        <h2>Projects Menu</h2>
      </div>
      <nav className="ph-left-nav">
        {PROJECTS_MENU.map((item) => {
          const liveCount = COUNT_KEYS[item.id] ? menuCounts[COUNT_KEYS[item.id]] : item.count;
          return (
            <button
              key={item.id}
              type="button"
              className={`ph-left-link${activeMenu === item.id ? ' is-active' : ''}`}
              onClick={() => onMenuSelect(item.id)}
            >
              <span>{item.label}</span>
              {liveCount != null ? <span className="ph-left-count">{liveCount}</span> : null}
            </button>
          );
        })}
      </nav>
      <ShowroomPanelsNavItem hubPath="/projects/showrooms" variant="premium" />
      <div className={`ph-create-box${activeMenu === 'create-project' ? ' is-active' : ''}`}>
        <h3>Create New Project</h3>
        <p>Turn your idea into reality. Start building something amazing today.</p>
        <button type="button" className="ph-btn ph-btn--primary" onClick={onNewProject}>
          <FiPlus size={16} aria-hidden />
          New Project
        </button>
      </div>
      <div className="ph-categories">
        <h3>Project Categories</h3>
        <ul>
          {PROJECT_CATEGORIES.map((cat) => (
            <li key={cat.id}>
              <button type="button" className="ph-cat-row">
                <span>{cat.label}</span>
                <span className="ph-left-count">{cat.count}</span>
              </button>
            </li>
          ))}
        </ul>
        <Link to="/projects" className="ph-cat-view-all">
          View All Categories
        </Link>
      </div>
    </aside>
  );
}
