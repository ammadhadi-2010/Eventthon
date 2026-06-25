import React from 'react';
import { FiBookmark } from 'react-icons/fi';

export default function SavedRowActions({ title, onUnsave }) {
  return (
    <div className="ph-sv-actions">
      <button type="button" className="ph-sv-actions__btn is-saved" onClick={onUnsave} aria-label={`Remove ${title} from saved`}>
        <FiBookmark size={16} aria-hidden />
      </button>
    </div>
  );
}
