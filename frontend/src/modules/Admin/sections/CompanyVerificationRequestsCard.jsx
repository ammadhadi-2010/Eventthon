import React from 'react';
import { Link } from 'react-router-dom';

export default function CompanyVerificationRequestsCard({ items }) {
  const rows = Array.isArray(items) ? items : [];

  return (
    <section className="admin-card">
      <div className="admin-card-header">
        <h3>Verification Requests</h3>
        <Link to="/admin-control/companies" className="admin-link">
          View all
        </Link>
      </div>
      <div className="admin-card-body">
        {rows.length === 0 ? (
          <p className="admin-muted">No pending company verification requests.</p>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="admin-list-row">
              <div>
                <strong>{row.name}</strong>
                <p className="admin-muted">
                  {row.country || "Country not set"} · {row.submittedOn}
                </p>
              </div>
              <span className="admin-chip admin-chip--warning">Pending</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
