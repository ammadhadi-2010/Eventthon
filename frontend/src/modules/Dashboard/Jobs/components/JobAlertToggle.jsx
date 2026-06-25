import React from 'react';

export default function JobAlertToggle({ enabled, onChange, label = 'Email' }) {
  return (
    <div className="ja-alert-toggle">
      <span className="ja-alert-toggle__label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${label} notifications ${enabled ? 'on' : 'off'}`}
        className={`ja-alert-toggle__switch${enabled ? ' is-on' : ''}`}
        onClick={() => onChange?.(!enabled)}
      >
        <span className="ja-alert-toggle__thumb" aria-hidden />
      </button>
    </div>
  );
}
