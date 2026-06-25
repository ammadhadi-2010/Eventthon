import React from 'react';
import { Star } from 'lucide-react';
import { buildGigReviews } from './gigShowroomUtils';

export default function GigShowroomReviews({ data, rating = 4.9, horizontal = false }) {
  const reviews = buildGigReviews(data);
  const score = Number(rating || 4.9).toFixed(1);
  const trackClass = horizontal ? 'ps-mp-reviews-track' : '';

  return (
    <section className="ps-mp-card ps-mp-card--premium" aria-label="Client reviews">
      <div className="ps-mp-reviews-head">
        <h2>Client Reviews</h2>
        <div className="ps-mp-reviews-score">
          <Star size={14} fill="#fbbf24" color="#fbbf24" aria-hidden />
          <strong>{score}</strong>
          <span>({reviews.length} reviews)</span>
        </div>
        <button type="button" className="ps-mp-reviews-link">
          View all reviews
        </button>
      </div>
      <div
        className={`${trackClass} grid grid-cols-1 gap-4 w-full lg:flex lg:flex-row lg:overflow-x-auto lg:gap-3 lg:pb-1`}
      >
        {reviews.map((review) => (
          <article
            key={review.id}
            className="ps-mp-review ps-mp-review--premium w-full lg:w-[280px] lg:shrink-0"
          >
            <div className="ps-mp-review__head">
              <span className="ps-mp-review__avatar" aria-hidden>
                {review.name.charAt(0)}
              </span>
              <div>
                <strong>{review.name}</strong>
                <p className="ps-mp-review__country">{review.country || 'United States'}</p>
                <p className="ps-mp-review__stars">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={11} fill="currentColor" aria-hidden />
                  ))}
                </p>
              </div>
            </div>
            <p className="ps-mp-prose">{review.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
