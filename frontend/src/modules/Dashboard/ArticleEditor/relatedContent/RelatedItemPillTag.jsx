import React from 'react';

export default function RelatedItemPillTag({ label, accent = 'green', onRemove }) {
  return (
    <span className={`arc-pill arc-pill--${accent}`}>
      <span className="arc-pill__label">{label}</span>
      <button
        type="button"
        className="arc-pill__remove"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
      >
        ×
      </button>
    </span>
  );
}
