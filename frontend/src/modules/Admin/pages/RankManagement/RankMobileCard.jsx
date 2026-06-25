import React from 'react';
import { Pencil } from 'lucide-react';
import RankBadgeViewport from './RankBadgeViewport';
import { formatVipBenefitPreview } from './rankDisplayHelpers';

export default function RankMobileCard({ row, onOpen, onEdit }) {
  const benefit = row.vipBenefitPreview || formatVipBenefitPreview(row);

  return (
    <article className="rm-mobile-card">
      <div className="rm-mobile-card__head">
        <RankBadgeViewport row={row} size="sm" />
        <div className="rm-mobile-card__copy">
          <button type="button" className="rm-mobile-card__title" onClick={() => onOpen(row)}>
            {row.rankName || row.name}
          </button>
          <p className="rm-mobile-card__code">{row.rankCode}</p>
        </div>
        <button type="button" className="um-row-menu" aria-label="Edit rank" onClick={() => onEdit(row)}>
          <Pencil size={14} />
        </button>
      </div>
      <div className="rm-mobile-card__meta">
        <span>{Number(row.minPoints || 0).toLocaleString()} pts</span>
        <span>{row.minDealsRequired ?? 0} deals</span>
        <span>{Number(row.minStarRating || 0).toFixed(1)}★ gate</span>
        <span className={`um-status-chip ${row.status === 'active' ? 'um-status--active' : 'um-status--unverified'}`}>
          {row.status?.toUpperCase()}
        </span>
      </div>
      <p className="rm-mobile-card__benefit">{benefit}</p>
      {row.nextRankCode ? (
        <p className="rm-mobile-card__next">Next lock: {row.nextRankCode} · {row.nextRankName}</p>
      ) : null}
    </article>
  );
}
