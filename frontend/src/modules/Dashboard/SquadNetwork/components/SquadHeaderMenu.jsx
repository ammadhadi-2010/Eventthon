import React, { useEffect, useRef, useState } from 'react';
import { FiCopy, FiLogOut, FiMoreVertical, FiSettings } from 'react-icons/fi';

export default function SquadHeaderMenu({ squadId, onCopyInvite, onSettings, onLeave }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const copyInvite = async () => {
    const link = `${window.location.origin}/squads${squadId ? `?join=${encodeURIComponent(squadId)}` : ''}`;
    try {
      await navigator.clipboard.writeText(link);
      onCopyInvite?.('Invite link copied to clipboard.');
    } catch {
      onCopyInvite?.('Could not copy link.');
    }
    setOpen(false);
  };

  return (
    <div className="sq-header-menu" ref={wrapRef}>
      <button
        type="button"
        className="sq-header-menu__trigger"
        aria-label="More squad actions"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <FiMoreVertical size={16} />
      </button>
      {open ? (
        <div className="sq-header-menu__panel" role="menu">
          <button type="button" role="menuitem" onClick={copyInvite}>
            <FiCopy size={14} aria-hidden />
            Copy Invite Link
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSettings?.();
            }}
          >
            <FiSettings size={14} aria-hidden />
            Squad Settings
          </button>
          <button
            type="button"
            role="menuitem"
            className="is-danger"
            onClick={() => {
              setOpen(false);
              onLeave?.();
            }}
          >
            <FiLogOut size={14} aria-hidden />
            Leave Squad
          </button>
        </div>
      ) : null}
    </div>
  );
}
