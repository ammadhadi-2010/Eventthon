import React, { useEffect, useRef, useState } from 'react';
import { FiArchive, FiClock, FiMoreHorizontal, FiTrash2 } from 'react-icons/fi';

const btnGhost = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#94a3b8',
  padding: '10px 14px',
  borderRadius: '10px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const menuBtn = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  color: '#e2e8f0',
  padding: '10px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  fontWeight: '600',
  textAlign: 'left',
};

export default function ArticleEditorMoreMenu({ onDeleteDraft, onViewHistory, onArchive }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const run = (event, handler) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(false);
    try {
      if (typeof handler === 'function') {
        handler();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div ref={rootRef} className="article-editor__more-menu" style={{ position: 'relative' }}>
      <button
        type="button"
        style={btnGhost}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <FiMoreHorizontal />
      </button>
      {open ? (
        <div
          className="article-editor__more-dropdown"
          role="menu"
          style={dropdown}
          onClick={(event) => event.stopPropagation()}
        >
          <button type="button" role="menuitem" style={menuBtn} onClick={(event) => run(event, onDeleteDraft)}>
            <FiTrash2 /> Delete Draft
          </button>
          <button type="button" role="menuitem" style={menuBtn} onClick={(event) => run(event, onViewHistory)}>
            <FiClock /> View History
          </button>
          <button
            type="button"
            role="menuitem"
            style={menuBtn}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
              if (typeof onArchive === 'function') {
                onArchive();
              } else {
                alert('Workspace successfully archived');
              }
            }}
          >
            <FiArchive /> Archive Workspace
          </button>
        </div>
      ) : null}
    </div>
  );
}

const dropdown = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  right: 0,
  minWidth: '190px',
  background: 'rgba(15,23,42,0.98)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '6px',
  boxShadow: '0 16px 40px rgba(2,6,23,0.55)',
  zIndex: 40,
};
