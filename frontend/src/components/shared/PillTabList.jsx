import React from 'react';

/**
 * Pill / chip tab row (filters). Single source for pill tab visuals — use everywhere instead of one-off buttons.
 */
export default function PillTabList({ tabs = [], value, onChange, ariaLabel, className = '' }) {
  const cn = ['esh-pill-tabs', className].filter(Boolean).join(' ');
  return (
    <div className={cn} role="tablist" aria-label={ariaLabel}>
      {tabs.map((t) => {
        const id = t.id ?? t.value;
        const label = t.label ?? t.name;
        const selected = value === id;
        return (
          <button
            key={String(id)}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`esh-pill-tab${selected ? ' esh-pill-tab--on' : ''}`}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
