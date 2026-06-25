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
            Filtered website targets from free web search and the EventThon company registry.
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
          Run <strong>Search Google Leads</strong> to populate outreach-ready website links.
        </div>
      ) : null}

      {!busy && rows.length ? (
        <div className="lh-discovery-scroll">
          <table className="lh-discovery-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Website URL</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td data-label="Business">{row.business_name}</td>
                  <td data-label="Website">
                    <a href={row.website_url} target="_blank" rel="noreferrer" className="lh-discovery-link">
                      {row.website_url}
                    </a>
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
