import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGrid } from 'react-icons/fi';
import ShowroomPanelsNavItem from '../../../Public/components/ShowroomPanelsNavItem';
import { jobMenu, topCategories } from '../data/jobsMenuData';

const JobsLeftSidebar = ({ activeSection, onSectionSelect, menuCounts = {} }) => {
  const navigate = useNavigate();
  return (
    <aside className="jobs-left-stack">
      <div className="gigs-card jobs-left-card">
        <p className="jobs-left-title">Jobs Menu</p>
        <div className="jobs-left-menu">
          {jobMenu.map((item) => {
            const Icon = item.icon;
            const count = menuCounts[item.id] ?? item.count;
            return (
              <button
                key={item.id}
                type="button"
                className={`jobs-left-menu-item${activeSection === item.id ? ' is-active' : ''}`}
                onClick={() => onSectionSelect(item.id)}
              >
                <span className="jobs-left-icon"><Icon size={13} /></span>
                <span>{item.label}</span>
                {item.comingSoon ? (
                  <em className="jobs-left-badge jobs-left-badge--soon">Coming Soon</em>
                ) : item.badge ? (
                  <em className="jobs-left-badge">{item.badge}</em>
                ) : null}
                {!item.comingSoon && count != null && count !== '' ? <small>{count}</small> : null}
              </button>
            );
          })}
        </div>
        <ShowroomPanelsNavItem
          className="sph-nav-link jobs-left-showroom-link"
          hubPath="/jobs/showrooms"
        />
      </div>

      <div className="gigs-card jobs-left-card jobs-alert-card">
        <h4>Never Miss the Right Job!</h4>
        <p>Get notified when roles matching your skills and preferences are posted.</p>
        <button
          type="button"
          className="jobs-alert-btn"
          onClick={() => navigate('/jobs/alerts/new')}
        >
          + Create Job Alert
        </button>
      </div>

      <div className="gigs-card jobs-left-card">
        <p className="jobs-left-title">Top Categories</p>
        <div className="jobs-cat-list">
          {topCategories.map(({ label, value, iconUi }) => (
            <div key={label} className="jobs-cat-row">
              <span className="jobs-cat-label-wrap">
                <em
                  className="jobs-cat-icon"
                  style={{
                    '--icon-gradient': iconUi?.gradient,
                    '--icon-glow': iconUi?.glow,
                  }}
                >
                  <FiGrid size={11} />
                </em>
                {label}
              </span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default JobsLeftSidebar;
