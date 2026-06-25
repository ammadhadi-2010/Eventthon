import React, { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiCompass, FiEdit2, FiUserPlus } from 'react-icons/fi';

export function SquadMobileActionToolbar({
  tabs,
  activeTab,
  onTabChange,
  onInvite,
  onExplore,
  canExplore = true,
  canInvite = true,
  onEditSquad,
  canEditSquad,
  headerMenu,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [activeTab]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isMenuOpen]);

  const selectTab = (label) => {
    onTabChange?.(label);
    setIsMenuOpen(false);
  };

  return (
    <div className="squad-hub__mobile-toolbar">
      <div className="squad-hub__mobile-toolbar-row">
        <div ref={rootRef} className="squad-hub__tab-picker">
          <button
            type="button"
            className="squad-hub__tab-picker-btn"
            aria-expanded={isMenuOpen}
            aria-haspopup="listbox"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span>{activeTab}</span>
            <FiChevronDown size={12} className={isMenuOpen ? 'is-open' : ''} aria-hidden />
          </button>
          {isMenuOpen ? (
            <div className="squad-hub__tab-picker-menu" role="listbox" aria-label="Squad sections">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.label}
                    type="button"
                    role="option"
                    aria-label={tab.label}
                    aria-selected={activeTab === tab.label}
                    className={`squad-hub__tab-picker-item${activeTab === tab.label ? ' is-active' : ''}`}
                    data-tab={tab.label}
                    style={{ '--tab-accent': tab.color }}
                    title={tab.label}
                    onClick={() => selectTab(tab.label)}
                  >
                    {Icon ? <Icon size={16} strokeWidth={2} /> : null}
                    <span className="squad-hub__tab-tip" role="tooltip">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        {canInvite ? (
          <button type="button" className="squad-hub__toolbar-invite" onClick={onInvite}>
            <FiUserPlus size={12} /> Invite
          </button>
        ) : null}

        {canExplore ? (
          <button type="button" className="squad-hub__toolbar-edit" onClick={onExplore}>
            <FiCompass size={12} /> Explore
          </button>
        ) : null}

        <button
          type="button"
          className="squad-hub__toolbar-edit"
          onClick={onEditSquad}
          disabled={!canEditSquad}
          aria-disabled={!canEditSquad}
        >
          <FiEdit2 size={12} /> Edit
        </button>

        <div className="squad-hub__toolbar-menu">{headerMenu}</div>
      </div>
    </div>
  );
}
