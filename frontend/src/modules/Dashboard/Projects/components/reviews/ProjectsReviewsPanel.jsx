import React, { useMemo } from 'react';
import { ReviewCard, StarRating, toReviewCardProps } from '../../../../../components/reviews';
import useProjectReviews from '../../hooks/useProjectReviews';
import '../../../Gigs/styles/GigsReviews.css';

export default function ProjectsReviewsPanel() {
  const { rows, summary, loading } = useProjectReviews({ limit: 3 });

  const breakdown = summary.breakdown?.length ? summary.breakdown : [];
  const totalRaw = Number(summary.total_reviews || 0);
  const total = Math.max(totalRaw, 1);
  const average = Number(summary.average_rating || 0);

  const topBreakdown = useMemo(() => breakdown.slice(0, 3), [breakdown]);

  return (
    <section className="ph-card ph-reviews-panel reviews-shell">
      <header className="reviews-head ph-reviews-panel__head">
        <h2 className="ph-section-title">Project Reviews</h2>
        <p>Ratings from clients on completed projects.</p>
      </header>

      <div className="ph-reviews-panel__summary reviews-summary">
        <div className="reviews-score-card ph-reviews-score">
          <strong>{average.toFixed(1)}</strong>
          <span>Overall rating</span>
          <StarRating rating={average} iconSize={13} />
          <small>({totalRaw} ratings)</small>
        </div>
        {topBreakdown.length > 0 ? (
          <div className="reviews-breakdown ph-reviews-breakdown">
            {topBreakdown.map((row) => (
              <div key={row.stars} className="reviews-row">
                <span>{row.stars} Stars</span>
                <div className="reviews-track">
                  <i style={{ width: `${Math.max(2, Math.round((row.count / total) * 100))}%` }} />
                </div>
                <small>{row.count}</small>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="ph-reviews-list reviews-list">
        {loading ? (
          <p className="reviews-empty">Loading reviews…</p>
        ) : rows.length === 0 ? (
          <p className="reviews-empty">No reviews yet. Reviews appear when clients rate completed projects.</p>
        ) : (
          <ul className="ph-reviews-cards">
            {rows.map((item) => (
              <ReviewCard
                key={item.id}
                variant="embedded"
                {...toReviewCardProps({
                  name: item.name,
                  projectTag: item.projectTitle,
                  stars: item.stars,
                  text: item.text,
                  date: item.date,
                })}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
