import React from 'react';
import { Eye } from 'lucide-react';
import { JOB_CATEGORY_CLASS, JOB_STATUS_CLASS, resolveJobImageurl } from './jobData';
import JobRowMenu from './JobRowMenu';

export default function JobTableRow({
  row,
  selected,
  onView,
  onEdit,
  onStatusChange,
  onDelete,
}) {
  const statusLabel = row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : '—';

  return (
    <tr className={selected ? 'jm-row--selected' : ''}>
      <td>
        <div className="um-user-cell">
          <img src={resolveJobImageurl(row)} alt="" className="um-avatar jm-company-logo" />
          <span className="um-name">{row.title}</span>
        </div>
      </td>
      <td>{row.company}</td>
      <td>
        <span className={`jm-cat-pill ${JOB_CATEGORY_CLASS[row.category] || ''}`}>{row.category}</span>
      </td>
      <td><span className="jm-loc-pill">{row.location}</span></td>
      <td className="um-td-mono">{row.salary}</td>
      <td className="um-td-muted">{row.posted}</td>
      <td>
        <span className={`um-status-chip ${JOB_STATUS_CLASS[row.status] || ''}`}>{statusLabel}</span>
      </td>
      <td className="um-td-mono">{row.applicants}</td>
      <td className="um-th-actions">
        <div className="sdm-actions">
          <button
            type="button"
            className="um-row-menu"
            aria-label={`View ${row.title}`}
            aria-pressed={selected}
            onClick={() => onView(row)}
          >
            <Eye size={14} />
          </button>
          <JobRowMenu
            row={row}
            onEdit={onEdit}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        </div>
      </td>
    </tr>
  );
}
