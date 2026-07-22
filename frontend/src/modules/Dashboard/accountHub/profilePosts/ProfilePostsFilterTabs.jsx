import React from 'react';
import { PROFILE_POST_TABS } from './profilePostsUtils';

export default function ProfilePostsFilterTabs({ activeTab, onChange, counts = {} }) {
  return (
    <div className="pposts-tabs" role="tablist" aria-label="Filter posts">
      {PROFILE_POST_TABS.map((tab) => {
        const count = counts[tab.id];
        const label = count == null ? tab.label : `${tab.label} (${count})`;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`pposts-tabs__btn${isActive ? ' is-active' : ''}`}
            onClick={() => onChange?.(tab.id)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function buildTabCounts(items = []) {
  return {
    all: items.length,
    published: items.filter((row) => row.status === 'published').length,
    draft: items.filter((row) => row.status === 'draft').length,
    scheduled: items.filter((row) => row.status === 'scheduled').length,
    pinned: items.filter((row) => row.pinned).length,
    articles: items.filter((row) => row.kind === 'article').length,
  };
}

export { buildTabCounts };
