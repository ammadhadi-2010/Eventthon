import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical } from 'lucide-react';

const MENU_ITEMS = [
  { key: 'edit', label: 'Edit Job', kind: 'edit' },
  { key: 'open', label: 'Change Status — Open', status: 'active' },
  { key: 'closed', label: 'Change Status — Closed', status: 'expired', danger: true },
  { key: 'delete', label: 'Delete Job Posting', kind: 'delete', danger: true },
];

export default function JobRowMenu({ row, onEdit, onStatusChange, onDelete }) {
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

  const runItem = (item) => {
    setOpen(false);
    if (item.kind === 'edit') {
      onEdit?.(row);
      return;
    }
    if (item.kind === 'delete') {
      const ok = window.confirm(`Delete "${row.title}" posting permanently?`);
      if (!ok) return;
      onDelete?.(row);
      return;
    }
    if (item.status) onStatusChange?.(row, item.status);
  };

  return (
    <div className="um-row-menu-wrap" ref={wrapRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="um-row-menu min-h-[44px] min-w-[44px] touch-manipulation"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Job actions"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical size={16} strokeWidth={2} />
      </button>
      {open ? (
        <ul className="um-row-menu-list" role="menu">
          {MENU_ITEMS.map((item) => (
            <li key={item.key} role="none">
              <button
                type="button"
                role="menuitem"
                className={`um-row-menu-item${item.danger ? ' um-row-menu-item--danger' : ''}`}
                onClick={() => runItem(item)}
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
