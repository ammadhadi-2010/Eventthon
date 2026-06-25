import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical } from 'lucide-react';

const MENU_ITEMS = [
  { key: 'edit', label: 'Edit Squad', kind: 'edit' },
  { key: 'active', label: 'Change Status — Active', status: 'ACTIVE' },
  { key: 'suspend', label: 'Change Status — Suspended', status: 'SUSPENDED', danger: true },
  { key: 'disband', label: 'Disband Squad', kind: 'disband', danger: true },
];

export default function SquadRowMenu({ row, onEdit, onStatusChange, onDisband }) {
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
    if (item.kind === 'disband') {
      const ok = window.confirm(`Disband "${row.name}"? This removes the squad from admin view.`);
      if (!ok) return;
      onDisband?.(row);
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
        aria-label="Squad actions"
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
