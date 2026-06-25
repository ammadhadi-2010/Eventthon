import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { sidebarItems } from '../data/adminConfig';

function DropdownCompaniesGroup({ item, onClose }) {
  const { pathname, hash } = useLocation();
  const [open, setOpen] = useState(true);
  const Icon = item.icon;
  const childActive = item.children?.some((child) => {
    const [childPath, childHash = ''] = child.to.split('#');
    return pathname === childPath && (!childHash || hash === `#${childHash}`);
  });
  const active = pathname.startsWith('/admin-control/companies') || childActive;

  return (
    <div className="space-y-1">
      <button
        type="button"
        className={`agn-nav-dropdown__item w-full justify-between ${active ? 'agn-nav-dropdown__item--active' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          {Icon ? <Icon size={15} aria-hidden /> : null}
          <span>{item.label}</span>
        </span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="ml-5 space-y-1">
          {item.children.map((child) => (
            <NavLink
              key={child.id}
              to={child.to}
              onClick={onClose}
              className={({ isActive }) =>
                `agn-nav-dropdown__item text-[12px] ${isActive ? 'agn-nav-dropdown__item--active' : ''}`
              }
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span>{child.label}</span>
                {child.badge != null ? <span className="agn-nav-dropdown__badge">{child.badge}</span> : null}
              </span>
            </NavLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminNavDropdown({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="agn-nav-dropdown" role="menu" aria-label="Admin navigation">
      {sidebarItems.map((item) => {
        if (!item.to) return null;
        if (item.children?.length) {
          return <DropdownCompaniesGroup key={item.id} item={item} onClose={onClose} />;
        }
        if (item.variant === 'footer-cms') {
          return (
            <NavLink
              key={item.id}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `agn-nav-dropdown__item${isActive ? ' agn-nav-dropdown__item--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          );
        }
        const Icon = item.icon;
        return (
          <NavLink
            key={item.id}
            to={item.to}
            end={item.id === 'dashboard'}
            onClick={onClose}
            className={({ isActive }) =>
              `agn-nav-dropdown__item${isActive ? ' agn-nav-dropdown__item--active' : ''}`
            }
          >
            {Icon ? <Icon size={15} aria-hidden /> : null}
            <span>{item.label}</span>
            {item.badge != null ? <span className="agn-nav-dropdown__badge">{item.badge}</span> : null}
          </NavLink>
        );
      })}
    </div>
  );
}
