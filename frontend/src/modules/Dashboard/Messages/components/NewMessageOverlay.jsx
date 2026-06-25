import React, { useEffect, useRef, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const NewMessageOverlay = ({
  open,
  query,
  recipients,
  onQueryChange,
  onClose,
  onPickRecipient,
}) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setActiveIdx(0);
    inputRef.current?.focus();
  }, [open, query]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (!recipients.length) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIdx((prev) => Math.min(prev + 1, recipients.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIdx((prev) => Math.max(prev - 1, 0));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        onPickRecipient(recipients[activeIdx] || recipients[0]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, recipients, activeIdx, onClose, onPickRecipient]);

  if (!open) return null;

  return (
    <div className="msgx-overlay" role="presentation" onClick={onClose}>
      <div className="msgx-overlay-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="msgx-overlay-head">
          <h4>New Message</h4>
          <button type="button" onClick={onClose} aria-label="Close">
            <FiX size={16} />
          </button>
        </div>
        <label className="msgx-search">
          <FiSearch size={14} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search seller or conversation..."
          />
        </label>
        <div className="msgx-overlay-list">
          {recipients.length === 0 ? (
            <p className="msgx-empty">No recipients found.</p>
          ) : (
            recipients.map((row, idx) => (
              <button
                key={`${row.seller_user_id}-${row.context_id || row.context_title}`}
                type="button"
                className={`msgx-overlay-item${activeIdx === idx ? ' is-active' : ''}`}
                onClick={() => onPickRecipient(row)}
                onMouseEnter={() => setActiveIdx(idx)}
              >
                <strong>{row.from_user_name || row.from_user_id || 'Unknown seller'}</strong>
                <small>{row.context_title || 'Conversation'}</small>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NewMessageOverlay;
