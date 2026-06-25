import React from 'react';
import { Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RankBadgeViewport from './RankBadgeViewport';
import { formatVipBenefitPreview } from './rankDisplayHelpers';

export default function RankMatrixTable({ rows, onEdit }) {
  const navigate = useNavigate();

  return (
    <div className="rm-desktop-table um-table-wrap">
      <div className="um-table-scroll">
        <table className="um-table rm-matrix-table">
          <thead>
            <tr>
              <th>BADGE</th>
              <th>CODE</th>
              <th>RANK NAME</th>
              <th>MIN POINTS</th>
              <th>REQ. DEALS</th>
              <th>STARS GATE</th>
              <th>VIP BENEFIT PREVIEW</th>
              <th>STATUS</th>
              <th className="um-th-actions">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={9} className="um-table-empty">No ranks found.</td></tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td><RankBadgeViewport row={row} size="sm" /></td>
                  <td className="rm-matrix-table__code">{row.rankCode}</td>
                  <td>
                    <button type="button" className="um-row-menu" onClick={() => navigate(`/admin-control/ranks/${row.id}`)}>
                      {row.rankName || row.name}
                    </button>
                  </td>
                  <td>{Number(row.minPoints || 0).toLocaleString()}</td>
                  <td>{row.minDealsRequired ?? 0}</td>
                  <td>{Number(row.minStarRating || 0).toFixed(1)}</td>
                  <td className="rm-vip-cell">{row.vipBenefitPreview || formatVipBenefitPreview(row)}</td>
                  <td>
                    <span className={`um-status-chip ${row.status === 'active' ? 'um-status--active' : 'um-status--unverified'}`}>
                      {row.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="um-th-actions">
                    <button type="button" className="um-row-menu" aria-label="Edit rank" onClick={() => onEdit(row)}>
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
