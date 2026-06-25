import React from 'react';
import { Search } from 'lucide-react';
import { resolveCompanyImageurl } from './companyImage';
import { COMPANY_STATUS_CLASS } from './companyData';
import CompanyRowMenu from './CompanyRowMenu';

export default function CompanyTable({
  rows,
  loading,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  industryFilter,
  onIndustryFilterChange,
  sizeFilter,
  onSizeFilterChange,
  industries,
  sizes,
  onCompanyAction,
  onAddCompany,
  onRecentRegistrations,
  recentOnly = false,
  toolbarHidden = false,
}) {
  return (
    <section className="um-card cm-main-card">
      <div
        className={`cm-toolbar-row cm-toolbar-row--sticky${
          toolbarHidden ? ' cm-toolbar-row--scroll-hidden' : ''
        }`}
      >
        <div className="um-toolbar cm-toolbar">
          <div className="um-search cm-search-wide">
            <Search size={14} className="um-search-icon" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search companies by name, industry or location..."
              className="um-search-input"
            />
          </div>
          <select className="cm-select" value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} aria-label="Status">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
          </select>
          <select className="cm-select" value={industryFilter} onChange={(e) => onIndustryFilterChange(e.target.value)} aria-label="Industry">
            <option value="all">All Industries</option>
            {industries.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select className="cm-select" value={sizeFilter} onChange={(e) => onSizeFilterChange(e.target.value)} aria-label="Size">
            <option value="all">All Sizes</option>
            {sizes.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          {onRecentRegistrations ? (
            <button
              type="button"
              className={`cm-recent-link${recentOnly ? ' is-active' : ''}`}
              onClick={onRecentRegistrations}
              aria-pressed={recentOnly}
            >
              Recent Registrations
            </button>
          ) : null}
        </div>
        {onAddCompany ? (
          <button type="button" className="um-btn um-btn--primary cm-toolbar__cta" onClick={onAddCompany}>
            + Add Company
          </button>
        ) : null}
      </div>

      {recentOnly ? (
        <p className="cm-recent-banner" role="status">
          Showing the latest company registrations first.
          <button type="button" className="cm-recent-banner__clear" onClick={onRecentRegistrations}>
            Show all
          </button>
        </p>
      ) : null}

      <div className={`um-table-wrap cm-table-responsive${loading ? ' um-table-wrap--loading' : ''}`}>
        <div className="um-table-scroll scrollbar-thin w-full overflow-x-auto">
          <table className="um-table cm-table">
            <thead>
              <tr>
                <th>COMPANY</th>
                <th>INDUSTRY</th>
                <th>LOCATION</th>
                <th>JOBS</th>
                <th>EMPLOYEES</th>
                <th>STATUS</th>
                <th>JOINED</th>
                <th className="um-th-actions">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="um-table-empty">
                    {loading ? 'Loading companies…' : recentOnly ? 'No recent registrations found.' : 'No Registered Companies Yet'}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="cm-table-row">
                    <td className="cm-table-cell cm-table-cell--company">
                      <div className="um-user-cell cm-user-cell">
                        <img src={resolveCompanyImageurl(row.imageurl, row.name)} alt="" className="um-avatar cm-logo" />
                        <div>
                          <span className="um-name">{row.name}</span>
                          {row.isVerified ? <span className="cm-verified-badge">Verified</span> : null}
                        </div>
                      </div>
                    </td>
                    <td className="cm-table-cell">{row.industry || '—'}</td>
                    <td className="cm-table-cell um-td-muted">{row.location || '—'}</td>
                    <td className="cm-table-cell cm-jobs-count">{row.openJobs ?? 0}</td>
                    <td className="cm-table-cell">{row.size || '—'}</td>
                    <td className="cm-table-cell cm-table-cell--status">
                      <span className={`um-status-chip ${COMPANY_STATUS_CLASS[row.status] || ''}`}>
                        {(row.status || 'active').charAt(0).toUpperCase() + (row.status || 'active').slice(1)}
                      </span>
                    </td>
                    <td className="cm-table-cell um-td-muted">{row.joined}</td>
                    <td className="cm-table-cell cm-table-cell--actions">
                      <CompanyRowMenu row={row} onAction={onCompanyAction} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
