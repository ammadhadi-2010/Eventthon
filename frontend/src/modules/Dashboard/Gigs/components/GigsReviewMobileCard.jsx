import React from 'react';
import { StarRating } from '../../../../components/reviews';
import { reviewerInitial } from '../../../../components/reviews/starRatingUtils';

export default function GigsReviewMobileCard({ item }) {
  const initial = reviewerInitial(item.name);

  return (
    <article className="gr-m-card">
      <div className="gr-m-user">
        <span className="gr-m-av" aria-hidden>
          {initial}
        </span>
        <div className="gr-m-id">
          <strong>{item.name}</strong>
          <StarRating rating={item.stars} iconSize={12} />
        </div>
      </div>
      {item.text ? <p className="gr-m-comment">{item.text}</p> : null}
      <div className="gr-m-foot">
        <span className="gr-m-gig">{item.gigTitle}</span>
        {item.date ? <time dateTime={item.date}>{item.date}</time> : null}
      </div>
    </article>
  );
}
