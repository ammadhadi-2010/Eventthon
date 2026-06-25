import React from 'react';
import { AUTOMATION_PLATFORMS } from './automationData';

export default function CreatePostPlatforms({ selected, onToggle, connectedPlatforms }) {
  const enabled = new Set(connectedPlatforms.map((p) => p.id));

  return (
    <div className="auto-platform-grid">
      <p className="auto-field-label">Select Platforms</p>
      <div className="auto-platform-row">
        {AUTOMATION_PLATFORMS.map((platform) => {
          const active = selected.includes(platform.id);
          const disabled = !enabled.has(platform.id);
          return (
            <button
              key={platform.id}
              type="button"
              className={`auto-platform-btn${active ? ' auto-platform-btn--active' : ''}${disabled ? ' auto-platform-btn--disabled' : ''}`}
              aria-pressed={active}
              disabled={disabled}
              onClick={() => onToggle(platform.id)}
              title={disabled ? 'Enable in Automation Settings' : platform.label}
            >
              <span className="auto-platform-short">{platform.short}</span>
              <span className="auto-platform-name">{platform.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
