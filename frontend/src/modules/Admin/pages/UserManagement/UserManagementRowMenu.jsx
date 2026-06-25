import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import { buildUserDetailPath, resolveUserLookup } from './userProfileReviewUtils';

function buildMenuItems(row) {
  const status = row.adminStatus;
  const items = [{ key: 'edit_role', label: 'Edit User Role', kind: 'nav' }];
  if (status === 'pending' || status === 'unverified') {
    items.push({ key: 'verify', label: 'Change Status — Verify', action: 'approve_verification' });
  }
  if (status !== 'suspended' && status !== 'deleted') {
    items.push({ key: 'suspend', label: 'Change Status — Suspend', action: 'suspend', danger: true });
  }
  if (status === 'suspended') {
    items.push({ key: 'activate', label: 'Change Status — Activate', action: 'activate' });
  }
  items.push({ key: 'delete', label: 'Delete Account', action: 'delete_user', danger: true });
  return items;
}

export default function UserManagementRowMenu({ row, onAction, onOpenUser }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const items = buildMenuItems(row);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const openDetail = () => {
    setOpen(false);
    if (onOpenUser) {
      onOpenUser(row);
      return;
    }
    navigate(buildUserDetailPath(row), { state: { seedRow: row } });
  };

  const runAction = async (item) => {
    setOpen(false);
    if (item.kind === 'nav') {
      openDetail();
      return;
    }
    const lookup = resolveUserLookup(row);
    const actionKey = lookup?.id || lookup?.email || lookup?.mobile;
    if (!actionKey) return;
    if (item.action === 'delete_user') {
      const ok = window.confirm('Permanently delete this account?');
      if (!ok) return;
    }
    try {
      await onAction(actionKey, item.action);
    } catch (e) {
      window.alert(e?.response?.data?.detail || e?.message || 'Action failed');
    }
  };

  return (
    <div className="um-row-menu-wrap" ref={wrapRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="um-row-menu min-h-[44px] min-w-[44px] touch-manipulation"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical size={16} strokeWidth={2} />
      </button>
      {open ? (
        <ul className="um-row-menu-list" role="menu">
          {items.map((item) => (
            <li key={item.key} role="none">
              <button
                type="button"
                role="menuitem"
                className={`um-row-menu-item${item.danger ? ' um-row-menu-item--danger' : ''}`}
                onClick={() => runAction(item)}
              >
                {item.label}
              </button>
            </li>
          ))}
          {resolveUserLookup(row) ? (
            <li role="none">
              <button type="button" role="menuitem" className="um-row-menu-item" onClick={openDetail}>
                View full profile
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
