import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical } from 'lucide-react';

const ITEMS = [
  { key: 'publish', label: 'Publish Now', status: 'success' },
  { key: 'pending', label: 'Mark Pending', status: 'pending' },
  { key: 'failed', label: 'Mark Failed', status: 'failed' },
  { key: 'delete', label: 'Delete Post', kind: 'delete', danger: true },
];

export default function AutomationRowMenu({ row, onPublish, onStatusChange, onDelete }) {
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

  const run = (item) => {
    setOpen(false);
    if (item.kind === 'delete') {
      const ok = window.confirm(`Delete "${row.title}" permanently?`);
      if (ok) onDelete?.(row.id);
      return;
    }
    if (item.key === 'publish') {
      onPublish?.(row.id);
      return;
    }
    if (item.status) onStatusChange?.(row.id, item.status);
  };

  return (
    <div className="um-row-menu-wrap" ref={wrapRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="um-row-menu min-h-[44px] min-w-[44px] touch-manipulation"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Post actions"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical size={16} strokeWidth={2} />
      </button>
      {open ? (
        <ul className="um-row-menu-list" role="menu">
          {ITEMS.map((item) => (
            <li key={item.key} role="none">
              <button
                type="button"
                role="menuitem"
                className={`um-row-menu-item${item.danger ? ' um-row-menu-item--danger' : ''}`}
                onClick={() => run(item)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
