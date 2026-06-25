import React from 'react';

const LABELS = {
  overview: 'Overview',
  projects: 'Projects',
  skills: 'Skills & Niche',
  reviews: 'Reviews',
  activity: 'Activity',
  squads: 'Squads',
  connections: 'Connections',
  followers: 'Followers',
};

export default function DevProfileOverviewTabs({ activeTab, onChange, tabIds }) {
  return (
    <nav className="dpo-tabs" aria-label="Profile sections">
      {tabIds.map((id) => (
        <button
          key={id}
          type="button"
          className={`dpo-tab${activeTab === id ? ' dpo-tab--active' : ''}`}
          onClick={() => onChange(id)}
        >
          {LABELS[id] || id}
        </button>
      ))}
    </nav>
  );
}
