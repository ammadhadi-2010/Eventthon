import React from 'react';

export default function JobPreviewToggle({ checked, onChange, label, sub }) {
  return (
    <label className="jpw-toggle-row">
      <div className="jpw-toggle-copy">
        <span>{label}</span>
        {sub ? <small>{sub}</small> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`jpw-toggle${checked ? ' is-on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="jpw-toggle__knob" />
      </button>
    </label>
  );
}
