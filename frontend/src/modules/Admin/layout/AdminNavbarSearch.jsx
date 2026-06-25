import React from 'react';
import { FiSearch } from 'react-icons/fi';

export default function AdminNavbarSearch({ compact = false }) {
  return (
    <div className={`agn-navbar__search${compact ? ' agn-navbar__search--compact' : ''}`}>
      <FiSearch className="agn-navbar__search-icon" aria-hidden />
      <input
        type="search"
        placeholder={compact ? 'Search…' : 'Search users, companies, gigs, jobs…'}
        aria-label="Search admin workspace"
      />
    </div>
  );
}
