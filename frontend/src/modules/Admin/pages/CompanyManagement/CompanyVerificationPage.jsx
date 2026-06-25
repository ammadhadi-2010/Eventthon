import React from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyStats from './CompanyStats';
import CompanyRowMenu from './CompanyRowMenu';
import { useCompanyVerification } from './useCompanyVerification';
import { resolveCompanyImageurl } from './companyImage';
import { COMPANY_STATUS_CLASS } from './companyData';
import '../UserManagement/userManagement.css';
import '../JobManagement/jobManagement.css';
import './companyManagement.css';

export default function CompanyVerificationPage() {
  const navigate = useNavigate();
  const hub = useCompanyVerification();

  return (
    <div className="um-page">
      <header className="um-header cm-header">
        <div className="um-header-copy">
          <h1 className="um-title">Company Verification Requests</h1>
          <p className="um-subtitle">Review pending employer profiles and approve or reject submissions.</p>
        </div>
        <button type="button" className="um-btn um-btn--ghost" onClick={() => navigate('/admin-control/companies')}>
          All Companies
        </button>
      </header>

      <CompanyStats stats={hub.stats} />
      {hub.error ? <p className="cm-error-banner">{hub.error}</p> : null}

      <section className="um-card cm-main-card">
        <div className="cm-widget-head">
          <h2 className="cm-widget-title">Pending verification</h2>
          <span className="cm-widget-empty">{hub.rows.length} request{hub.rows.length === 1 ? '' : 's'}</span>
        </div>
        <div className={`um-table-wrap${hub.loading ? ' um-table-wrap--loading' : ''}`}>
          <div className="um-table-scroll">
            <table className="um-table">
              <thead>
                <tr>
                  <th>COMPANY</th>
                  <th>INDUSTRY</th>
                  <th>LOCATION</th>
                  <th>STATUS</th>
                  <th>JOINED</th>
                  <th className="um-th-actions">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {hub.rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="um-table-empty">
                      {hub.loading ? 'Loading requests…' : 'No pending company verification requests.'}
                    </td>
                  </tr>
                ) : (
                  hub.rows.map((row) => (
                    <tr key={row.id} className="cm-table-row">
                      <td className="cm-table-cell">
                        <div className="um-user-cell cm-user-cell">
                          <img src={resolveCompanyImageurl(row.imageurl, row.name)} alt="" className="um-avatar cm-logo" />
                          <span className="um-name">{row.name}</span>
                        </div>
                      </td>
                      <td className="cm-table-cell">{row.industry || '—'}</td>
                      <td className="cm-table-cell um-td-muted">{row.location || '—'}</td>
                      <td className="cm-table-cell">
                        <span className={`um-status-chip ${COMPANY_STATUS_CLASS[row.status] || ''}`}>
                          Pending
                        </span>
                      </td>
                      <td className="cm-table-cell um-td-muted">{row.joined}</td>
                      <td className="cm-table-cell cm-table-cell--actions">
                        <CompanyRowMenu row={row} onAction={hub.runCompanyAction} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
