import React, { useEffect, useRef, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const NewMessageOverlay = ({
  open,
  query,
  recipients,
  onQueryChange,
  onClose,
  onPickRecipient,
  companyMode = false,
  squadMode = false,
  loading = false,
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
          <h4>
            {squadMode
              ? 'Message squad member'
              : companyMode
                ? 'Message team member'
                : 'New Message'}
          </h4>
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
            placeholder={
              squadMode
                ? 'Search squad members by name…'
                : companyMode
                  ? 'Search attached members by name or ID…'
                  : 'Search by name or user ID…'
            }
          />
        </label>
        <div className="msgx-overlay-list">
          {loading ? (
            <p className="msgx-empty">
              {squadMode ? 'Loading squad members…' : 'Loading team members…'}
            </p>
          ) : recipients.length === 0 ? (
            <p className="msgx-empty">
              {squadMode
                ? 'No squad members found. Invite members from the Members tab first.'
                : companyMode
                  ? 'No attached members found. Invite teammates from Team Members first.'
                  : 'No contacts found. Message someone from a gig, job, or project first.'}
            </p>
          ) : (
            recipients.map((row, idx) => {
              const peerId = String(row.peer_user_id || row.from_user_id || row.seller_user_id || '').trim();
              const peerName = String(row.peer_user_name || row.from_user_name || '').trim();
              return (
                <button
                  key={`${peerId}-${row.context_id || row.context_title || idx}`}
                  type="button"
                  className={`msgx-overlay-item${activeIdx === idx ? ' is-active' : ''}`}
                  onClick={() => onPickRecipient(row)}
                  onMouseEnter={() => setActiveIdx(idx)}
                >
                  <strong>{peerName && peerName !== peerId ? peerName : peerId || 'Unknown contact'}</strong>
                  {peerId ? <small className="msgx-overlay-item__id">ID: {peerId}</small> : null}
                  <small>{row.context_title || row.chat_tag || 'Conversation'}</small>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NewMessageOverlay;
