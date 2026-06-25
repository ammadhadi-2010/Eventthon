import React from 'react';
import { Eye } from 'lucide-react';
import { SQUAD_STATUS_CLASS, resolveSquadImageurl } from './squadData';
import SquadRowMenu from './SquadRowMenu';

export default function SquadManagementTable({
  rows,
  loading,
  selectedSquadId,
  onViewSquad,
  onEditSquad,
  onStatusChange,
  onDisbandSquad,
}) {
  return (
    <div className="um-table-block">
      <div className={`um-table-wrap${loading ? ' um-table-wrap--loading' : ''}`}>
        <div className="um-table-scroll">
          <table className="um-table">
            <thead>
              <tr>
                <th>SQUAD</th>
                <th>CATEGORY</th>
                <th>MEMBERS</th>
                <th>LEADER</th>
                <th>STATUS</th>
                <th>CREATED ON</th>
                <th className="um-th-actions">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="um-table-empty">
                    No squads match this filter.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const selected = String(row.id) === String(selectedSquadId);
                  return (
                    <tr key={row.id} className={selected ? 'sm-row--selected' : ''}>
                      <td>
                        <div className="um-user-cell">
                          <img src={resolveSquadImageurl(row)} alt="" className="um-avatar" />
                          <div className="um-user-text">
                            <span className="um-name">{row.name}</span>
                            <span className="um-handle">{row.handle}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="um-role-pill">{row.category}</span>
                      </td>
                      <td className="um-td-mono">{row.members}</td>
                      <td>{row.leader}</td>
                      <td>
                        <span className={`um-status-chip ${SQUAD_STATUS_CLASS[row.status]}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="um-td-muted">{row.createdOn}</td>
                      <td className="um-th-actions">
                        <div className="sdm-actions">
                          <button
                            type="button"
                            className="um-row-menu"
                            aria-label={`View ${row.name}`}
                            aria-pressed={selected}
                            onClick={() => onViewSquad(row)}
                          >
                            <Eye size={14} />
                          </button>
                          <SquadRowMenu
                            row={row}
                            onEdit={onEditSquad}
                            onStatusChange={onStatusChange}
                            onDisband={onDisbandSquad}
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
