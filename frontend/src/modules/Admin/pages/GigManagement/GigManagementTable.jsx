import React from 'react';
import { Eye } from 'lucide-react';
import { GIG_STATUS_CLASS, posterAvatarUrl, resolveGigImageurl } from './gigData';
import GigRowMenu from './GigRowMenu';

export default function GigManagementTable({
  rows,
  loading,
  viewingGigId,
  onViewGig,
  onApprove,
  onSuspend,
  onDelete,
}) {
  return (
    <div className="um-table-block gm-table-block">
      <div className={`um-table-wrap${loading ? ' um-table-wrap--loading' : ''}`}>
        <div className="um-table-scroll w-full overflow-x-auto">
          <table className="um-table min-w-[1000px]">
            <thead>
              <tr>
                <th>GIG TITLE</th>
                <th>CATEGORY</th>
                <th>POSTED BY</th>
                <th>BUDGET</th>
                <th>STATUS</th>
                <th>POSTED ON</th>
                <th className="um-th-actions">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="um-table-empty">
                    No gigs match this filter.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const selected = String(row.id) === String(viewingGigId);
                  return (
                    <tr key={row.id} className={selected ? 'gm-row--selected' : ''}>
                      <td>
                        <div className="um-user-cell">
                          <img
                            src={resolveGigImageurl(row)}
                            alt=""
                            className="um-avatar gm-gig-thumb"
                          />
                          <div className="um-user-text">
                            <span className="um-name">{row.title}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="um-role-pill">{row.category}</span>
                      </td>
                      <td>
                        <div className="um-user-cell">
                          <img src={posterAvatarUrl(row)} alt="" className="um-avatar" />
                          <div className="um-user-text">
                            <span className="um-name">{row.postedByName}</span>
                            <span className="um-handle">{row.postedBy}</span>
                          </div>
                        </div>
                      </td>
                      <td className="um-td-mono">{row.budget}</td>
                      <td>
                        <span className={`um-status-chip ${GIG_STATUS_CLASS[row.status]}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="um-td-muted">{row.postedOn}</td>
                      <td className="um-th-actions">
                        <div className="sdm-actions">
                          <button
                            type="button"
                            className="um-row-menu"
                            aria-label={`View ${row.title}`}
                            aria-pressed={selected}
                            onClick={() => onViewGig(row)}
                          >
                            <Eye size={14} />
                          </button>
                          <GigRowMenu
                            row={row}
                            onApprove={onApprove}
                            onSuspend={onSuspend}
                            onDelete={onDelete}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
