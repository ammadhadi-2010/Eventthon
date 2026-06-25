import React from 'react';
import { FiX } from 'react-icons/fi';

export function ChipGroup({ label, options, value, onChange }) {
  return (
    <div className="ja-field">
      <span className="ja-label">{label}</span>
      <div className="ja-chips">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`ja-chip${value === opt ? ' is-active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TagList({ tags, onRemove }) {
  return (
    <div className="ja-tags">
      {tags.map((tag) => (
        <span key={tag} className="ja-tag">
          {tag}
          <button type="button" aria-label={`Remove ${tag}`} onClick={() => onRemove(tag)}>
            <FiX size={12} />
          </button>
        </span>
      ))}
    </div>
  );
}
