import React, { useState } from 'react';
import { FiBookmark } from 'react-icons/fi';

/** Bookmark control wired to Jobs hub saved-jobs API. */
export default function JobBookmarkButton({ job, saved, onToggle, className = '' }) {
  const role = job?.role || 'job';
  const [busy, setBusy] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      await onToggle?.(job);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={`${className}${saved ? ' is-saved' : ''}${busy ? ' is-busy' : ''}`.trim()}
      aria-label={saved ? `Remove ${role} from saved` : `Save ${role}`}
      aria-pressed={saved}
      disabled={busy}
      onClick={handleClick}
    >
      <FiBookmark size={16} aria-hidden />
    </button>
  );
}
