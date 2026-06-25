import React from 'react';
import { FiX } from 'react-icons/fi';

export default function TagBadge({ label, onRemove }) {
  return (
    <span className="cp-tag">
      {label}
      <button type="button" className="cp-tag__remove" onClick={onRemove} aria-label={`Remove ${label}`}>
        <FiX size={12} />
      </button>
    </span>
  );
}
