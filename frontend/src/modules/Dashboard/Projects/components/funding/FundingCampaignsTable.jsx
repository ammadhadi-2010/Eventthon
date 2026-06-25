import React from 'react';
import FundingRaisedCell from './FundingRaisedCell';

function CampaignCell({ row }) {
  return (
    <div className="ph-mp-project">
      <span className={`ph-mp-project-icon ph-mp-project-icon--${row.iconTone}`}>
        {row.iconGlyph || row.title.charAt(0)}
      </span>
      <strong className="ph-fund-campaign-title">{row.title}</strong>
    </div>
  );
}

function FundingMobileCard({ row }) {
  return (
    <article className="ph-mp-mobile-card ph-fund-mobile-card">
      <div className="ph-mp-mobile-top">
        <CampaignCell row={row} />
        <span className="ph-fund-status">{row.status}</span>
      </div>
      <FundingRaisedCell raised={row.raised} raisedPct={row.raisedPct} />
      <div className="ph-mp-mobile-meta ph-fund-mobile-meta">
        <span>{row.goal}</span>
        <span>{row.backers} backers</span>
        <span>{row.endsIn}</span>
      </div>
    </article>
  );
}

export default function FundingCampaignsTable({ rows }) {
  return (
    <section className="ph-card ph-fund-table-card">
      <h2 className="ph-fund-section-title">Funding Campaigns</h2>
      <div className="ph-mp-mobile-list" aria-label="Funding campaigns list">
        {rows.map((row) => (
          <FundingMobileCard key={row.id} row={row} />
        ))}
      </div>
      <div className="ph-table-scroll">
        <table className="ph-table ph-fund-table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Goal</th>
              <th>Raised</th>
              <th>Backers</th>
              <th>Status</th>
              <th>Ends In</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="ph-mp-row">
                <td>
                  <CampaignCell row={row} />
                </td>
                <td className="ph-fund-muted">{row.goal}</td>
                <td>
                  <FundingRaisedCell raised={row.raised} raisedPct={row.raisedPct} />
                </td>
                <td className="ph-fund-muted">{row.backers}</td>
                <td>
                  <span className="ph-fund-status">{row.status}</span>
                </td>
                <td className="ph-fund-muted">{row.endsIn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
