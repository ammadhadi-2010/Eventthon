import React, { useState } from 'react';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'projects', label: 'Projects' },
  { id: 'earnings', label: 'Earnings' },
  { id: 'skills', label: 'Skills & Niche' },
  { id: 'verification', label: 'Verification' },
  { id: 'activity', label: 'Activity' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'documents', label: 'Documents' },
];

export default function UserDetailTabs() {
  const [active, setActive] = useState('overview');
  return (
    <div className="ud-tabs">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`ud-tab ${active === t.id ? 'ud-tab--active' : ''}`}
          onClick={() => setActive(t.id)}
          disabled={t.id !== 'overview'}
        >
          {t.label}
          {t.id === 'projects' ? <span className="ud-tab-count">12</span> : null}
        </button>
      ))}
    </div>
  );
}
