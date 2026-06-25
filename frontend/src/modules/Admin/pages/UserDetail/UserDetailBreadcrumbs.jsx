import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function UserDetailBreadcrumbs({ displayName }) {
  return (
    <nav className="ud-breadcrumb" aria-label="Breadcrumb">
      <Link to="/admin-control/users" className="ud-breadcrumb__link">
        User Management
      </Link>
      <ChevronRight size={14} className="ud-breadcrumb__sep" aria-hidden />
      <span className="ud-breadcrumb__current">{displayName || 'User details'}</span>
    </nav>
  );
}
