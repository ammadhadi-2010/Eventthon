import React from 'react';
import { POST_TYPE_TABS } from './postWizardTypes';

export default function PostModalTypeTabs({ activeType, onSelect, disabled }) {
  return (
    <div className="post-modal__tabs" role="tablist" aria-label="Post type">
      {POST_TYPE_TABS.map(({ key, label, Icon, color }) => {
        const active = activeType === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            className={`post-modal__tab${active ? ' post-modal__tab--active' : ''}`}
            style={active ? { background: color, borderColor: `${color}66` } : { borderColor: `${color}40`, color }}
            onClick={() => onSelect(key)}
            disabled={disabled}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
