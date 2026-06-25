import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyStats from './CompanyStats';
import CompanyTable from './CompanyTable';
import CompanyEditModal from './CompanyEditModal';
import { useCompanyManagement } from './useCompanyManagement';
import { COMPANY_HUB_CREATE_PATH } from './companyHubPaths';
import useScrollHideNavbar from '../../hooks/useScrollHideNavbar';
import '../UserManagement/userManagement.css';
import '../JobManagement/jobManagement.css';
import './companyManagement.css';

export default function CompanyManagementPage() {
  const navigate = useNavigate();
  const hub = useCompanyManagement();
  const { hidden: chromeHidden } = useScrollHideNavbar(true);
  const tableAnchorRef = useRef(null);
  const [editRow, setEditRow] = useState(null);
  const [saving, setSaving] = useState(false);

  const industries = useMemo(() => {
    const set = new Set();
    hub.rows.forEach((r) => {
      if (r.industry) set.add(r.industry);
    });
    return [...set].sort();
  }, [hub.rows]);

  const sizes = useMemo(() => {
    const set = new Set();
    hub.rows.forEach((r) => {
      if (r.size) set.add(r.size);
    });
    return [...set].sort();
  }, [hub.rows]);

  const handleSave = async (id, form) => {
    setSaving(true);
    try {
      const updated = await hub.saveCompany(id, form);
      if (updated) setEditRow(null);
    } finally {
      setSaving(false);
    }
  };

  const handleRecentRegistrations = () => {
    const enabling = !hub.recentOnly;
    hub.toggleRecentOnly();
    if (enabling) {
      window.requestAnimationFrame(() => {
        tableAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  return (
    <div className="um-page cm-page">
      <div className={`cm-page-chrome${chromeHidden ? ' cm-page-chrome--scroll-hidden' : ''}`}>
        <header className="um-header cm-header">
          <div className="um-header-copy">
            <h1 className="um-title">Companies Management</h1>
            <p className="um-subtitle">Manage registered companies, verification, and hiring profiles.</p>
          </div>
        </header>
        <CompanyStats stats={hub.stats} />
        {hub.error ? <p className="cm-error-banner">{hub.error}</p> : null}
      </div>

      <div ref={tableAnchorRef} className="cm-table-anchor">
        <CompanyTable
          rows={hub.tableRows}
          loading={hub.loading}
          query={hub.query}
          onQueryChange={hub.setQuery}
          statusFilter={hub.statusFilter}
          onStatusFilterChange={hub.setStatusFilter}
          industryFilter={hub.industryFilter}
          onIndustryFilterChange={hub.setIndustryFilter}
          sizeFilter={hub.sizeFilter}
          onSizeFilterChange={hub.setSizeFilter}
          industries={industries}
          sizes={sizes}
          onCompanyAction={hub.runCompanyAction}
          onAddCompany={() => navigate(COMPANY_HUB_CREATE_PATH)}
          onRecentRegistrations={handleRecentRegistrations}
          recentOnly={hub.recentOnly}
          toolbarHidden={chromeHidden}
        />
      </div>

      <CompanyEditModal
        company={editRow}
        open={Boolean(editRow)}
        saving={saving}
        onClose={() => setEditRow(null)}
        onSave={handleSave}
      />
    </div>
  );
}
