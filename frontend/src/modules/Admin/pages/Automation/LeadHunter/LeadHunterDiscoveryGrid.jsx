import React, { memo } from 'react';
import { Globe2, Loader2 } from 'lucide-react';

function LeadHunterDiscoveryGrid({ rows, busy, onLoad }) {
  return (
    <section className="um-card lh-card lh-discovery">
      <div className="lh-card-head">
        <Globe2 size={18} aria-hidden />
        <div>
          <h2 className="auto-card-title">Discovered Industry Leads</h2>
          <p className="lh-card-sub">
            Localized businesses with verified website and email data after extract.
          </p>
        </div>
      </div>

      {busy ? (
        <div className="lh-discovery-empty">
          <Loader2 size={18} className="lh-spin" aria-hidden />
          <span>Searching for industry leads…</span>
        </div>
      ) : null}

      {!busy && !rows.length ? (
        <div className="lh-discovery-empty">
          Run <strong>Search Google Leads</strong>, then <strong>Run Extract</strong> to verify emails.
        </div>
      ) : null}

      {!busy && rows.length ? (
        <div className="lh-discovery-scroll">
          <table className="lh-discovery-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Website URL</th>
                <th>Verified Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td data-label="Company">{row.business_name || row.company || '—'}</td>
                  <td data-label="Website">
                    <a href={row.website_url} target="_blank" rel="noreferrer" className="lh-discovery-link">
                      {row.website_url}
                    </a>
                  </td>
                  <td data-label="Email" className="lh-discovery-email">
                    {row.email ? <span className="lh-email-pill">{row.email}</span> : <span className="lh-email-pending">Run Extract</span>}
                  </td>
                  <td data-label="Action">
                    <button type="button" className="um-btn um-btn--ghost lh-load-btn" onClick={() => onLoad(row)}>
                      Load into Hunter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

export default memo(LeadHunterDiscoveryGrid);
