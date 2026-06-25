import React, { useEffect, useState } from 'react';
import { FiArrowLeft, FiMessageSquare, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useDashboardShell } from '../../context/dashboardShellContext';
import MobileHubAvatarButton from './MobileHubAvatarButton';
import MemberHubCompanySwitch from './MemberHubCompanySwitch';
import './hub-mobile-topbar.css';

/**
 * Shared mobile top bar: profile avatar (or back) + hub search + messages.
 * Use HUB_MOBILE_SEARCH presets for hub-specific placeholder copy.
 */
export default function HubMobileTopBar({
  isVisible = true,
  scrollDirection,
  searchQuery = '',
  onSearchChange,
  onSearchQueryChange,
  onSearch,
  searchPlaceholder = 'Search...',
  searchAriaLabel,
  searchMode = 'commit',
  avatarAction = 'userMenu',
  onAvatarClick,
  avatarAriaLabel = 'Open menu',
  headerAriaLabel = 'Mobile header',
  showBackButton = false,
  onBack,
  backAriaLabel = 'Go back',
  wrapChrome = true,
}) {
  const navigate = useNavigate();
  const { toggleMobileUserMenu, toggleMobileLeftDrawer } = useDashboardShell();
  const [draft, setDraft] = useState(searchQuery || '');

  useEffect(() => {
    setDraft(searchQuery || '');
  }, [searchQuery]);

  const hidden = scrollDirection != null ? scrollDirection === 'down' : !isVisible;
  const aria = searchAriaLabel || searchPlaceholder;

  const commitSearch = (value = draft) => {
    const next = typeof value === 'string' ? value.trim() : draft.trim();
    onSearchChange?.(next);
    onSearchQueryChange?.(next);
    onSearch?.(next);
  };

  const handleAvatarClick =
    onAvatarClick ||
    (avatarAction === 'leftDrawer'
      ? () => toggleMobileLeftDrawer?.()
      : () => toggleMobileUserMenu?.());

  const handleBack = onBack || (() => navigate(-1));

  const bar = (
    <header className="hub-mobile-topbar" aria-label={headerAriaLabel}>
      {showBackButton ? (
        <button
          type="button"
          className="hub-mobile-topbar__back-btn"
          onClick={handleBack}
          aria-label={backAriaLabel}
        >
          <FiArrowLeft size={18} aria-hidden />
        </button>
      ) : (
        <MobileHubAvatarButton
          btnClassName="hub-mobile-topbar__avatar-btn"
          imgClassName="hub-mobile-topbar__avatar"
          onClick={handleAvatarClick}
          ariaLabel={avatarAriaLabel}
        />
      )}

      <div className="hub-mobile-topbar__search">
        <FiSearch className="hub-mobile-topbar__search-icon" aria-hidden />
        <input
          type="search"
          className="hub-mobile-topbar__search-input"
          placeholder={searchPlaceholder}
          value={draft}
          onChange={(e) => {
            const value = e.target.value;
            setDraft(value);
            if (searchMode === 'instant') {
              onSearchChange?.(value);
              onSearchQueryChange?.(value);
            }
          }}
          onKeyDown={(e) => e.key === 'Enter' && commitSearch()}
          onBlur={searchMode === 'commit' ? () => commitSearch() : undefined}
          aria-label={aria}
        />
      </div>

      <MemberHubCompanySwitch variant="compact" />

      <button
        type="button"
        className="hub-mobile-topbar__msg-btn"
        onClick={() => navigate('/messages')}
        aria-label="Open messages"
      >
        <FiMessageSquare size={20} aria-hidden />
      </button>
    </header>
  );

  if (!wrapChrome) {
    return bar;
  }

  return (
    <div
      className={`hub-mobile-chrome${hidden ? ' hub-mobile-chrome--hidden' : ''}`}
      aria-hidden={hidden}
    >
      {bar}
    </div>
  );
}
