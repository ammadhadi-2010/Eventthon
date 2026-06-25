import React, { useEffect, useRef, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { PROJECTS_MENU } from '../data/projectsHubData';

const COUNT_KEYS = {
  'my-projects': 'my-projects',
  collaborations: 'collaborations',
  saved: 'saved',
  funding: 'funding',
  reviews: 'reviews',
};

export default function ProjectsHubOverviewMenu({ activeMenu, onMenuSelect, menuCounts = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    setIsOpen(false);
  }, [activeMenu]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isOpen]);

  const selectItem = (id) => {
    onMenuSelect?.(id);
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className="ph-overview-menu">
      <button
        type="button"
        className="ph-hero-action-btn ph-hero-action-btn--dropdown"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Open projects navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        <FiChevronDown size={14} className={isOpen ? 'is-open' : ''} aria-hidden />
      </button>
      {isOpen ? (
        <div className="ph-overview-menu-panel" role="menu" aria-label="Projects hub navigation">
          {PROJECTS_MENU.map((item) => {
            const liveCount = COUNT_KEYS[item.id] ? menuCounts[COUNT_KEYS[item.id]] : item.count;
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                className={`ph-overview-menu-item${activeMenu === item.id ? ' is-active' : ''}`}
                onClick={() => selectItem(item.id)}
              >
                <span>{item.label}</span>
                {liveCount != null ? <span className="ph-overview-menu-badge">{liveCount}</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
