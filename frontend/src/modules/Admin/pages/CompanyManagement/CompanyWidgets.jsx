import React from 'react';
import { resolveCompanyImageurl } from './companyImage';
import { COMPANY_STATUS_CLASS } from './companyData';
import CompanyRowMenu from './CompanyRowMenu';

function CompanyList({ title, rows, emptyText, actionLabel, onAction, onCompanyAction }) {
  return (
    <section className="um-card cm-widget-card">
      <div className="cm-widget-head">
        <h2 className="cm-widget-title">{title}</h2>
        {actionLabel ? (
          <button type="button" className="cm-link-btn" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>
      <ul className="cm-widget-list">
        {rows.length === 0 ? (
          <li className="cm-widget-empty">{emptyText}</li>
        ) : (
          rows.map((row) => (
            <li key={row.id} className="cm-widget-row">
              <img src={resolveCompanyImageurl(row.imageurl, row.name)} alt="" className="cm-widget-logo" />
              <div className="cm-widget-copy">
                <strong>{row.name}</strong>
                <span>{row.industry || 'General'}</span>
              </div>
              {onCompanyAction ? (
                <CompanyRowMenu row={row} onAction={onCompanyAction} />
              ) : (
                <span className={`um-status-chip ${COMPANY_STATUS_CLASS[row.status] || 'cm-status--pending'}`}>
                  {(row.status || 'pending').charAt(0).toUpperCase() + (row.status || 'pending').slice(1)}
                </span>
              )}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

export function CompanyRecentWidget({ rows }) {
  return (
    <CompanyList
      title="Recent Company Registrations"
      rows={rows}
      emptyText="No recent registrations."
    />
  );
}

export function CompanyVerificationWidget({ rows, onViewAll, onCompanyAction }) {
  return (
    <CompanyList
      title="Verification Requests"
      rows={rows}
      emptyText="No pending verification requests."
      actionLabel="View All"
      onAction={onViewAll}
      onCompanyAction={onCompanyAction}
    />
  );
}
