import React from 'react';
import CompanyDetailBreadcrumbs from './CompanyDetailBreadcrumbs';
import CompanyDetailLeftCard from './CompanyDetailLeftCard';
import CompanyDetailCenterPanel from './CompanyDetailCenterPanel';
import CompanyDetailRightPanel from './CompanyDetailRightPanel';

export default function CompanyDetailView({ company, onRefetch }) {
  return (
    <div className="ud-view">
      <div className="ud-topbar">
        <CompanyDetailBreadcrumbs companyName={company?.name} />
      </div>
      <div className="ud-grid">
        <CompanyDetailLeftCard company={company} />
        <CompanyDetailCenterPanel company={company} />
        <CompanyDetailRightPanel company={company} onAfterAction={onRefetch} />
      </div>
    </div>
  );
}
