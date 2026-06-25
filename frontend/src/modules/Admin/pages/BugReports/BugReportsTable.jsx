import React from 'react';
import { Eye } from 'lucide-react';
import { formatRelativeTime, priorityClassName, statusClassName } from './bugReportLabels';
import { resolveReporterImageurl } from './reporterAvatar';

export default function BugReportsTable({ rows, loading, onOpen }) {
  if (loading) {
    return <p className="abr-empty">Loading bug reports…</p>;
  }

  if (!rows.length) {
    return <p className="abr-empty">No bug reports match the current filters.</p>;
  }

  return (
    <section className="abr-table-wrap admin-chip">
      <table className="abr-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title &amp; Description</th>
            <th>Reporter</th>
            <th>Page / Location</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Submitted</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} onClick={() => onOpen(row.id)}>
              <td className="abr-table__id">{row.report_code || row.id}</td>
              <td className="abr-table__copy">
                <strong>{row.title || 'Bug Report'}</strong>
                <span>{row.description}</span>
              </td>
              <td>
                <div className="abr-table__reporter">
                  <img
                    src={resolveReporterImageurl(row.reporter_imageurl, row.reporter_name)}
                    alt=""
                  />
                  <span>{row.reporter_name || 'Anonymous Reporter'}</span>
                </div>
              </td>
              <td className="abr-table__route">{row.page_location || row.page_url}</td>
              <td>
                <span className={priorityClassName(row.priority)}>{row.priority || 'Medium'}</span>
              </td>
              <td>
                <span className={statusClassName(row.status)}>{row.status || 'New'}</span>
              </td>
              <td>{formatRelativeTime(row.created_at)}</td>
              <td>
                <button
                  type="button"
                  className="abr-table__view"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpen(row.id);
                  }}
                  aria-label="View report"
                >
                  <Eye size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
