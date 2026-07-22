import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import AdminNavbarActions from './AdminNavbarActions';

export default function AdminNavbarMobile({ brandSlot, hubDrawerTrigger, actionProps }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleSearch = () => setIsSearchOpen((open) => !open);

  return (
    <div className="agn-navbar__mobile">
      <div className="agn-navbar__mobile-head flex min-w-0 items-center gap-2">
        <div className="agn-navbar__mobile-brand flex shrink-0 items-center gap-1.5">
          {brandSlot}
          {hubDrawerTrigger}
        </div>

        <div className="agn-navbar__mobile-toolbar ml-auto flex min-w-0 flex-nowrap items-center gap-2">
          <button
            type="button"
            className="agn-navbar__search-toggle"
            onClick={toggleSearch}
            aria-label="Toggle search"
            aria-expanded={isSearchOpen}
          >
            <FiSearch size={18} aria-hidden />
          </button>
          <AdminNavbarActions {...actionProps} mobileInline />
        </div>
      </div>

      {isSearchOpen ? (
        <div className="agn-navbar__search-panel">
          <FiSearch className="agn-navbar__search-panel-icon" aria-hidden />
          <input
            type="search"
            placeholder="Search users, companies, gigs, jobs…"
            aria-label="Search admin workspace"
            autoFocus
          />
        </div>
      ) : null}
    </div>
  );
}
