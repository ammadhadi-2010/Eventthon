import React from 'react';

export default function JobAlertsTable({ rows, loading }) {
  return (
    <section className="um-card jm-main-card jm-main-card--full">
      <div className={`um-table-wrap${loading ? ' um-table-wrap--loading' : ''}`}>
        <div className="um-table-scroll">
          <table className="um-table">
            <thead>
              <tr>
                <th>USER IDENTIFIER</th>
                <th>SUBSCRIBED CATEGORY / SKILL</th>
                <th>LOCATION CONSTRAINT</th>
                <th>CREATION DATE</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="um-table-empty">
                    {loading ? 'Loading alerts…' : 'No Active Alerts'}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td className="um-td-mono">{row.userIdentifier}</td>
                    <td>
                      <span className="jm-cat-pill">{row.categorySkill}</span>
                    </td>
                    <td><span className="jm-loc-pill">{row.locationConstraint}</span></td>
                    <td className="um-td-muted">{row.createdAt}</td>
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
