import React from 'react';
import AdminNavbarActions from './AdminNavbarActions';
import AdminNavbarSearch from './AdminNavbarSearch';

export default function AdminNavbarMobile({ brandSlot, actionProps }) {
  return (
    <div className="agn-navbar__mobile lg:hidden">
      <div className="agn-navbar__mobile-head">
        <div className="agn-navbar__mobile-brand">{brandSlot}</div>
        <AdminNavbarSearch compact />
        <AdminNavbarActions {...actionProps} />
      </div>
    </div>
  );
}
