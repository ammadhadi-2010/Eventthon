import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import { copyToClipboard } from './companyClipboard';
import { buildCompanyUtilityItems, COMPANY_STATUS_ACTIONS, isCompanyPending } from './companyRowMenuConfig';

const MENU_WIDTH = 216;
const MENU_EST_HEIGHT = 280;

function buildMenuStyle(anchorEl, open) {
  if (!open || !anchorEl) return null;
  const rect = anchorEl.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUp = spaceBelow < MENU_EST_HEIGHT && rect.top > MENU_EST_HEIGHT;
  const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
  const top = openUp ? rect.top - MENU_EST_HEIGHT - 6 : rect.bottom + 6;
  return { position: 'fixed', top, left, width: MENU_WIDTH, zIndex: 12000 };
}

export default function CompanyRowMenu({ row, onAction }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const btnRef = useRef(null);
  const listRef = useRef(null);
  const pending = isCompanyPending(row);
  const utilityItems = buildCompanyUtilityItems(row);
  const statusActions = COMPANY_STATUS_ACTIONS.filter((item) => {
    if (item.action === 'approve' || item.action === 'reject') return true;
    return true;
  });

  useLayoutEffect(() => {
    if (!open) {
      setMenuStyle(null);
      return;
    }
    setMenuStyle(buildMenuStyle(btnRef.current, open));
    const onReflow = () => setMenuStyle(buildMenuStyle(btnRef.current, true));
    window.addEventListener('resize', onReflow);
    window.addEventListener('scroll', onReflow, true);
    return () => {
      window.removeEventListener('resize', onReflow);
      window.removeEventListener('scroll', onReflow, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (btnRef.current?.contains(e.target) || listRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const runCopy = async (value, label) => {
    const ok = await copyToClipboard(value);
    setOpen(false);
    if (!ok) window.alert(`Could not copy ${label}`);
  };

  const openDetail = () => {
    setOpen(false);
    navigate(`/admin-control/companies/detail?companyId=${encodeURIComponent(row.id)}`);
  };

  const runStatus = async (action) => {
    if ((action === 'approve' || action === 'reject') && !pending) return;
    setOpen(false);
    try {
      if (action === 'delete') {
        const ok = window.confirm('Permanently delete this company profile?');
        if (!ok) return;
      }
      await onAction(row, action);
    } catch (err) {
      window.alert(err?.response?.data?.detail || err?.message || 'Action failed');
    }
  };

  const menu =
    open && menuStyle ? (
      <ul ref={listRef} className="cm-row-menu-list um-row-menu-list cm-row-menu-portal" role="menu" style={menuStyle}>
        {utilityItems.map((item) => (
          <li key={item.key} role="none">
            <button
              type="button"
              role="menuitem"
              className="um-row-menu-item"
              onClick={() => {
                if (item.kind === 'nav') openDetail();
                else runCopy(item.value, item.label);
              }}
            >
              {item.label}
            </button>
          </li>
        ))}
        {utilityItems.length > 0 && statusActions.length > 0 ? (
          <li className="um-row-menu-divider" role="separator" aria-hidden="true" />
        ) : null}
        {statusActions.map((item) => {
          const disabled = (item.action === 'approve' || item.action === 'reject') && !pending;
          return (
            <li key={item.key} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={disabled}
                className={`um-row-menu-item${item.danger ? ' um-row-menu-item--danger' : ''}${
                  disabled ? ' cm-row-menu-item--disabled' : ''
                }`}
                onClick={() => runStatus(item.action)}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    ) : null;

  return (
    <div className={`cm-row-menu-wrap${open ? ' cm-row-menu-wrap--open' : ''}`} onClick={(e) => e.stopPropagation()}>
      <button
        ref={btnRef}
        type="button"
        className="um-row-menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreVertical size={16} strokeWidth={2} />
      </button>
      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
