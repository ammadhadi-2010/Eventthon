import React from 'react';
import { ReviewCard, toReviewCardProps } from '../../../../components/reviews';

const GigExplorerReviewsTab = ({ selectedGig, reviewRows }) => (
  <div className="gigx-reviews-panel">
    <div className="gigx-review-summary">
      <div>
        <strong>{selectedGig.rating}</strong>
        <span>Overall rating</span>
      </div>
      <div>
        <strong>{selectedGig.reviews}</strong>
        <span>Completed orders</span>
      </div>
    </div>
    {reviewRows.length === 0 ? (
      <p className="gigx-reviews-empty">No reviews yet. Be the first to leave feedback after you order.</p>
    ) : (
      <ul className="gigx-review-list">
        {reviewRows.map((row) => (
          <ReviewCard
            key={row.id}
            variant="embedded"
            {...toReviewCardProps({
              name: row.name,
              serviceType: row.serviceType || selectedGig?.title,
              stars: row.stars,
              text: row.text,
              ago: row.ago,
            })}
          />
        ))}
      </ul>
    )}
  </div>
);

export default GigExplorerReviewsTab;
