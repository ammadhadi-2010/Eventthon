import React from 'react';
import { FiCalendar, FiExternalLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import {
  EXPLORER_MENU,
  EXPLORER_TIME_FILTERS,
  EXPLORER_TYPE_FILTERS,
} from './updatesExplorerConfig';
import { getUserDisplayName, pickImageurl, resolveDashboardMediaUrl } from '../utils/dashboardMedia';

export default function UpdatesExplorerSidebar({
  userData,
  menuFilter,
  onMenuChange,
  typeFilter,
  onTypeChange,
  timeFilter,
  onTimeChange,
}) {
  const navigate = useNavigate();
  const name = getUserDisplayName(userData);
  const avatar = resolveDashboardMediaUrl(pickImageurl(userData));

  return (
    <aside className="upd-explorer__sidebar hidden lg:flex lg:flex-col">
      <div className="upd-explorer__profile">
        <div className="upd-explorer__profile-avatar">
          {avatar ? <img src={avatar} alt={name} /> : <span>{name.charAt(0)}</span>}
        </div>
        <strong>{name}</strong>
        <span>{userData?.designation || 'Full Stack Developer'}</span>
        <div className="upd-explorer__profile-stats">
          <div><b>{userData?.jss_score ?? 100}%</b><small>JSS Score</small></div>
          <div><b>{userData?.experience_years ?? 0} Yrs</b><small>Experience</small></div>
        </div>
        <button type="button" className="upd-explorer__profile-btn" onClick={() => navigate('/profile')}>
          View Profile <FiExternalLink />
        </button>
      </div>

      <div className="upd-explorer__menu-block">
        <h3>Menu</h3>
        {EXPLORER_MENU.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`upd-explorer__menu-item${menuFilter === item.key ? ' is-active' : ''}`}
            onClick={() => onMenuChange(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="upd-explorer__filters-block">
        <h3>Filters</h3>
        <label className="upd-explorer__select-label">
          All Types
          <select value={typeFilter} onChange={(e) => onTypeChange(e.target.value)}>
            {EXPLORER_TYPE_FILTERS.map((item) => (
              <option key={item.key} value={item.key}>{item.label}</option>
            ))}
          </select>
        </label>
        <div className="upd-explorer__type-list">
          {EXPLORER_TYPE_FILTERS.filter((item) => item.key !== 'all').map((item) => (
            <button
              key={item.key}
              type="button"
              className={`upd-explorer__type-item${typeFilter === item.key ? ' is-active' : ''}`}
              onClick={() => onTypeChange(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="upd-explorer__time-row">
          <FiCalendar />
          <select value={timeFilter} onChange={(e) => onTimeChange(e.target.value)}>
            {EXPLORER_TIME_FILTERS.map((item) => (
              <option key={item.key} value={item.key}>{item.label}</option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  );
}
