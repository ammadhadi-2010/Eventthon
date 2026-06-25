import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import GigShowroomTrustBadges from './GigShowroomTrustBadges';
import GigShowroomDescription from './GigShowroomDescription';
import GigShowroomReviews from './GigShowroomReviews';
import { buildRelatedGigs } from './gigShowroomUtils';

export default function GigShowroomBottom({ data, rating }) {
  const related = buildRelatedGigs(data);

  return (
    <div className="ps-gig-bottom">
      <GigShowroomTrustBadges variant="banner" badges={data.trustBadges} />
      <GigShowroomDescription
        description={data.serviceDescription || data.dynamicBio}
        deliverables={data.deliverables}
      />
      <GigShowroomReviews data={data} rating={rating} horizontal />
      {related.length ? (
        <section className="ps-mp-card ps-mp-card--premium" aria-label="Related gigs">
          <h2>Related Gigs</h2>
          <div className="ps-mp-related-track grid grid-cols-2 lg:grid-cols-5 gap-3 w-full">
            {related.map((gig) => (
              <Link
                key={gig.publicSlug || gig.title}
                to={gig.publicPath || `/public/gigs/${gig.publicSlug}`}
                className="ps-mp-related-card ps-mp-related-card--premium w-full min-w-0"
              >
                {gig.imageurl ? (
                  <img
                    className="ps-mp-related-card__thumb-img w-full h-auto"
                    src={gig.imageurl}
                    alt=""
                  />
                ) : (
                  <div className="ps-mp-related-card__thumb w-full h-auto" />
                )}
                <strong>{gig.title}</strong>
                <span className="ps-mp-related-card__seller">{gig.sellerName}</span>
                <span className="ps-mp-related-card__meta">
                  <Star size={10} fill="#fbbf24" color="#fbbf24" aria-hidden />
                  {Number(gig.rating || 4.9).toFixed(1)} · Starting at ${gig.startingPrice}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
