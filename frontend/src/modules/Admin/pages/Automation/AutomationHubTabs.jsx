import React, { memo } from 'react';

function AutomationHubTabs({ active, onChange }) {
  return (
    <div className="auto-hub-tabs" role="tablist" aria-label="Automation sections">
      <button
        type="button"
        role="tab"
        aria-selected={active === 'posts'}
        className={`auto-hub-tab${active === 'posts' ? ' auto-hub-tab--active' : ''}`}
        onClick={() => onChange('posts')}
      >
        Social Posts
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === 'lead-hunter'}
        className={`auto-hub-tab${active === 'lead-hunter' ? ' auto-hub-tab--active' : ''}`}
        onClick={() => onChange('lead-hunter')}
      >
        Lead Hunter
      </button>
    </div>
  );
}

export default memo(AutomationHubTabs);
