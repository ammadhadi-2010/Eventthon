import React from 'react';

export default function ProposalsMobileCard({
  row,
  onView,
  onAccept,
  onReject,
  onDelete,
}) {
  const statusClass = `proposal-status is-${String(row.status || 'pending').toLowerCase()}`;

  return (
    <article className="prop-m-card">
      <div className="prop-m-top">
        <h3 className="prop-m-job">{row.job}</h3>
        <em className={statusClass}>{row.status}</em>
      </div>
      <div className="prop-m-mid">
        <span className="prop-m-client">{row.client}</span>
        <span className="prop-m-bid">{row.bidAmount}</span>
      </div>
      <p className="prop-m-date">{row.date}</p>
      <div className="prop-m-actions">
        <button type="button" className="is-view" onClick={() => onView(row)}>
          View
        </button>
        <button
          type="button"
          className="is-accept"
          onClick={() => onAccept(row)}
          disabled={row.status === 'Accepted'}
        >
          Accept
        </button>
        <button
          type="button"
          className="is-reject"
          onClick={() => onReject(row)}
          disabled={row.status === 'Rejected'}
        >
          Reject
        </button>
        <button type="button" className="is-delete" onClick={() => onDelete(row)}>
          Delete
        </button>
      </div>
    </article>
  );
}
