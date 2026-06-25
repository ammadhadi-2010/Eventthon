import React, { useEffect, useState } from 'react';
import { FiChevronDown, FiMessageSquare, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCompanyWorkspace } from '../../context/CompanyWorkspaceContext';
import { resolvePortalImageurl } from '../../utils/portalImage';

export default function CompanyMobileTopBar({
  isVisible = true,
  isSidebarOpen = false,
  onSidebarToggle,
}) {
  const navigate = useNavigate();
  const workspace = useCompanyWorkspace();
  const company = workspace?.data?.company;
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [logoSrc, setLogoSrc] = useState(() =>
    resolvePortalImageurl(company?.imageurl, company?.name),
  );

  useEffect(() => {
    setLogoSrc(resolvePortalImageurl(company?.imageurl, company?.name));
  }, [company?.imageurl, company?.name]);

  const shellClass = [
    'cp-mobile-chrome',
    'cp-mobile-chrome--top',
    isVisible ? '' : 'cp-mobile-chrome--hidden',
    searchOpen ? 'cp-mobile-chrome--search' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClass}>
      <header className="cp-mobile-topbar" aria-label="Company mobile header">
        <div className="cp-mobile-topbar__row">
          <div className="cp-mobile-topbar__left">
            <button
              type="button"
              className="cp-mobile-topbar__brand"
              onClick={() => navigate('/company/dashboard')}
              aria-label="Company dashboard home"
            >
              <span className="cp-mobile-topbar__mark">ET</span>
            </button>
            <button
              type="button"
              className={`cp-mobile-topbar__sidebar-toggle${isSidebarOpen ? ' is-open' : ''}`}
              onClick={onSidebarToggle}
              aria-label={isSidebarOpen ? 'Close company menu' : 'Open company menu'}
              aria-expanded={isSidebarOpen}
            >
              <FiChevronDown size={18} aria-hidden />
            </button>
          </div>
          <div className="cp-mobile-topbar__spacer" aria-hidden />
          <div className="cp-mobile-topbar__actions">
            <button
              type="button"
              className="cp-mobile-topbar__icon-btn"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label={searchOpen ? 'Close search' : 'Open search'}
              aria-expanded={searchOpen}
            >
              <FiSearch size={18} aria-hidden />
            </button>
            <button
              type="button"
              className="cp-mobile-topbar__icon-btn cp-mobile-topbar__icon-btn--chat"
              onClick={() => navigate('/company/messages')}
              aria-label="Open messages"
            >
              <FiMessageSquare size={20} aria-hidden />
              <span className="cp-mobile-topbar__chat-dot" aria-hidden />
            </button>
            <button
              type="button"
              className="cp-mobile-topbar__avatar-btn"
              onClick={() => navigate('/company/dashboard/settings')}
              aria-label="Company settings"
            >
              <img src={logoSrc} alt="" onError={() => setLogoSrc(resolvePortalImageurl('', company?.name))} />
            </button>
          </div>
        </div>
        {searchOpen ? (
          <div className="cp-mobile-topbar__search-panel">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs, applicants, workspace…"
              aria-label="Search company workspace"
            />
          </div>
        ) : null}
      </header>
    </div>
  );
}
