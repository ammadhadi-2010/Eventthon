import React from 'react';
import StarRating from './StarRating';
import { reviewerInitial } from './starRatingUtils';
import './review-card.css';

/**
 * @param {'default'|'list'|'embedded'} variant — layout context
 */
export default function ReviewCard({
  reviewerName,
  serviceType,
  rating,
  comment,
  date,
  avatarUrl = '',
  variant = 'default',
  className = '',
  showReply = false,
  onReply,
}) {
  const rootClass = ['review-card', `review-card--${variant}`, className].filter(Boolean).join(' ');
  const initial = reviewerInitial(reviewerName);
  const Tag = variant === 'embedded' ? 'li' : 'article';
  const hasFooter = Boolean(serviceType || showReply);

  return (
    <Tag className={rootClass}>
      <div className="review-card__avatar" aria-hidden>
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="review-card__avatar-img" />
        ) : (
          initial
        )}
      </div>
      <div className="review-card__body">
        <div className="review-card__head">
          <div className="review-card__identity">
            <h4 className="review-card__name">{reviewerName}</h4>
            <StarRating rating={rating} className="review-card__stars" iconSize={12} />
          </div>
          {date ? (
            <time className="review-card__date" dateTime={date}>
              {date}
            </time>
          ) : null}
        </div>
        {comment ? <p className="review-card__comment">{comment}</p> : null}
        {hasFooter ? (
          <div className="review-card__footer">
            {serviceType ? <span className="review-card__service">{serviceType}</span> : null}
            {showReply ? (
              <button type="button" className="review-card__reply" onClick={onReply}>
                Reply
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </Tag>
  );
}
