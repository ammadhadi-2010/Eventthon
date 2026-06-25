import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function CompanyDetailBreadcrumbs({ companyName }) {
  return (
    <nav className="ud-breadcrumbs" aria-label="Breadcrumb">
      <Link to="/admin-control/companies" className="ud-breadcrumb__link">
        Companies
      </Link>
      <ChevronRight size={13} className="ud-breadcrumb__sep" aria-hidden />
      <span className="ud-breadcrumb__current">{companyName || 'Company details'}</span>
    </nav>
  );
}
