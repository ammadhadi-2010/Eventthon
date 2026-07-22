import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import EventThonLogo from '../../../components/brand/EventThonLogo';
import HubPageDrawerTrigger from './HubPageDrawerTrigger';
import MemberNavbarActions from './MemberNavbarActions';

export default function MemberNavbarMobile({ user, notifCount, actionProps }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="member-navbar__mobile">
      <div className="member-navbar__mobile-head flex min-w-0 items-center gap-2">
        <div className="member-navbar__mobile-brand flex shrink-0 items-center gap-1.5">
          <button type="button" className="member-navbar__logo-link" onClick={handleLogoClick} aria-label="Go to home dashboard">
            <EventThonLogo variant="header" className="member-navbar__logo-img" />
          </button>
          <HubPageDrawerTrigger className="member-navbar__hub-drawer-trigger" />
        </div>

        <div className="member-navbar__mobile-toolbar ml-auto flex min-w-0 flex-nowrap items-center gap-2">
          <button
            type="button"
            className="member-navbar__search-toggle"
            onClick={() => setIsSearchOpen((open) => !open)}
            aria-label="Toggle search"
            aria-expanded={isSearchOpen}
          >
            <FiSearch size={18} aria-hidden />
          </button>
          <MemberNavbarActions {...actionProps} mobileInline />
        </div>
      </div>

      {isSearchOpen ? (
        <div className="member-navbar__search-panel">
          <FiSearch className="member-navbar__search-panel-icon" aria-hidden />
          <input type="search" placeholder="Search people, squads, gigs, jobs…" aria-label="Search workspace" autoFocus />
        </div>
      ) : null}
    </div>
  );
}
