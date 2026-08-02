import React from 'react';
import { CONVERSATION_LABELS, HIRING_STAGE_FILTERS } from './conversationOps';

export default function CompanyInboxFilters({ filters, onChange }) {
  const set = (key, value) => onChange?.({ ...filters, [key]: value });
  const toggleLabel = (id) => {
    const current = Array.isArray(filters.labels) ? filters.labels : [];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    set('labels', next);
  };

  return (
    <div className="cops-filters cops-filters--compact">
      <div className="cops-filters__row">
        <input
          value={filters.skills || ''}
          onChange={(e) => set('skills', e.target.value)}
          placeholder="Skills"
          aria-label="Filter by skills"
        />
        <select
          value={filters.stage || ''}
          onChange={(e) => set('stage', e.target.value)}
          aria-label="Filter by stage"
        >
          {HIRING_STAGE_FILTERS.map((s) => (
            <option key={s.id || 'any'} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>
      <div className="cops-filters__row">
        <input
          type="date"
          value={filters.date || ''}
          onChange={(e) => set('date', e.target.value)}
          aria-label="Filter by date"
        />
      </div>
      <div className="cops-chip-row" aria-label="Filter by labels">
        {CONVERSATION_LABELS.map((lab) => (
          <button
            key={lab.id}
            type="button"
            className={(filters.labels || []).includes(lab.id) ? 'is-on' : ''}
            onClick={() => toggleLabel(lab.id)}
          >
            {lab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
