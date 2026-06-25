import React, { useEffect, useMemo, useState } from 'react';
import { FiX } from 'react-icons/fi';
import EventThonBadge from '../EventThonBadge';
import { ELITE_RANK_MATRIX } from '../../models/rankMatrixData';
import { ensureRankMatrixLoaded, getCachedRankMatrix } from '../../services/rankMatrixCache';
import './footer-rank-matrix-modal.css';

function RankMatrixCard({ row }) {
  return (
    <article className="et-rank-matrix__card">
      <div className="et-rank-matrix__card-head">
        <EventThonBadge tier={row.badgeTier || row.rankCode} variant="sm" label={row.rankName} />
        <div>
          <strong>{row.rankCode}</strong>
          <span>{row.rankName}</span>
        </div>
      </div>
      <dl className="et-rank-matrix__card-stats">
        <div>
          <dt>Points</dt>
          <dd>{row.minPoints}</dd>
        </div>
        <div>
          <dt>Deals</dt>
          <dd>{row.minDealsRequired}</dd>
        </div>
        <div>
          <dt>Stars</dt>
          <dd>{row.minStarRating}</dd>
        </div>
      </dl>
      <p className="et-rank-matrix__benefits">{row.benefits}</p>
      {row.featureOnFrontlineDashboard ? (
        <span className="et-rank-matrix__vanguard-tag">Vanguard — Recruiter Featured</span>
      ) : null}
    </article>
  );
}

export default function RankMatrixModal({ open, onClose }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    ensureRankMatrixLoaded()
      .catch(() => null)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const rows = useMemo(() => {
    const cached = getCachedRankMatrix();
    return cached.length ? cached : ELITE_RANK_MATRIX;
  }, [ready, open]);

  if (!open) return null;

  return (
    <div className="et-rank-matrix-backdrop" role="presentation" onClick={onClose}>
      <div
        className="et-rank-matrix-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="et-rank-matrix-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="et-rank-matrix__head">
          <div className="et-rank-matrix__head-copy">
            <p className="et-rank-matrix__eyebrow">EventThon Elite Progression</p>
            <h2 id="et-rank-matrix-title">Rank Matrix</h2>
            <p className="et-rank-matrix__intro">
              Points, deals, and star rating must all be met to unlock each tier.
            </p>
          </div>
          <button type="button" className="et-rank-matrix__close" onClick={onClose} aria-label="Close rank matrix">
            <FiX size={18} />
          </button>
        </header>

        <div className="et-rank-matrix__body">
          <div className="et-rank-matrix__desktop et-rank-matrix__table-wrap">
            <table className="et-rank-matrix__table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Points</th>
                  <th>Deals</th>
                  <th>Stars</th>
                  <th>Perks &amp; Rewards</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.rankCode}>
                    <td>
                      <div className="et-rank-matrix__rank-cell">
                        <EventThonBadge tier={row.badgeTier || row.rankCode} variant="sm" label={row.rankName} />
                        <div>
                          <strong>{row.rankCode}</strong>
                          <span>{row.rankName}</span>
                        </div>
                      </div>
                    </td>
                    <td>{row.minPoints}</td>
                    <td>{row.minDealsRequired}</td>
                    <td>{row.minStarRating}</td>
                    <td>
                      <p className="et-rank-matrix__benefits">{row.benefits}</p>
                      {row.featureOnFrontlineDashboard ? (
                        <span className="et-rank-matrix__vanguard-tag">Ultimate Vanguard — Recruiter Featured</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="et-rank-matrix__mobile">
            {rows.map((row) => (
              <RankMatrixCard key={row.rankCode} row={row} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
