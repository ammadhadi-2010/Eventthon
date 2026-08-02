import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiBell, FiBriefcase, FiClipboard, FiHome, FiLayers, FiMessageSquare, FiUsers, FiX } from 'react-icons/fi';
import { subscribeHubDrawerToggle } from '../../Navbar/hubDrawerBus';
import './member-mobile-nav-drawer.css';

const LINKS = [
  { key: 'home', label: 'Home', path: '/dashboard', Icon: FiHome },
  { key: 'messages', label: 'Messages', path: '/messages', Icon: FiMessageSquare },
  { key: 'squads', label: 'Squads', path: '/squads', Icon: FiUsers },
  { key: 'projects', label: 'Projects', path: '/projects', Icon: FiBriefcase },
  { key: 'gigs', label: 'Gigs', path: '/gigs', Icon: FiLayers },
  { key: 'jobs', label: 'Jobs', path: '/jobs', Icon: FiClipboard },
  { key: 'alerts', label: 'Alerts Hub', path: '/notifications/alerts', Icon: FiBell },
];

/** Lightweight left nav for routes that don't mount hub page drawers (e.g. Messages). */
export default function MemberMobileNavDrawer() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => subscribeHubDrawerToggle('home', () => setOpen(true)), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="mmnd-root" role="dialog" aria-modal="true" aria-label="Member navigation">
      <button type="button" className="mmnd-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />
      <aside className="mmnd-panel">
        <header className="mmnd-head">
          <h3>Menu</h3>
          <button type="button" className="mmnd-close" aria-label="Close" onClick={() => setOpen(false)}>
            <FiX size={18} />
          </button>
        </header>
        <nav className="mmnd-nav">
          {LINKS.map(({ key, label, path, Icon }) => {
            const active =
              path === '/dashboard'
                ? pathname === '/dashboard' || pathname === '/'
                : pathname.startsWith(path);
            return (
              <button
                key={key}
                type="button"
                data-nav={key}
                className={`mmnd-link${active ? ' is-active' : ''}`}
                onClick={() => {
                  setOpen(false);
                  navigate(path);
                }}
              >
                <Icon size={18} aria-hidden />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
