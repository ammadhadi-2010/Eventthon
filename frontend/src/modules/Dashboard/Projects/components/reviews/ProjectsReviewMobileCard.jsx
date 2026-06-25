import React from 'react';
import { StarRating } from '../../../../../components/reviews';
import { reviewerInitial } from '../../../../../components/reviews/starRatingUtils';

function avatarSrc(item) {
  const raw = item.imageurl || item.imageUrl || '';
  if (typeof raw === 'string' && raw.startsWith('http')) return raw;
  return `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(item.name || 'user')}`;
}

export default function ProjectsReviewMobileCard({ item }) {
  const initial = reviewerInitial(item.name);

  return (
    <article className="ph-rev-m-card">
      <div className="ph-rev-m-top">
        <div className="ph-rev-m-user">
          <span className="ph-rev-m-av" aria-hidden>
            {item.imageurl || item.imageUrl ? (
              <img src={avatarSrc(item)} alt="" />
            ) : (
              initial
            )}
          </span>
          <div className="ph-rev-m-id">
            <strong>{item.name}</strong>
            <StarRating rating={item.stars} iconSize={12} />
          </div>
        </div>
      </div>
      {item.text ? <p className="ph-rev-m-comment">{item.text}</p> : null}
      <div className="ph-rev-m-foot">
        <span className="ph-rev-m-project">{item.projectTitle}</span>
        <div className="ph-rev-m-actions">
          {item.date ? <time dateTime={item.date}>{item.date}</time> : null}
          <button type="button" className="ph-rev-m-reply">
            Reply
          </button>
        </div>
      </div>
    </article>
  );
}
