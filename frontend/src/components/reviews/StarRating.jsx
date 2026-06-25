import React from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { formatStarLabel, getStarSlots } from './starRatingUtils';

/**
 * Filled / empty star row (Font Awesome icons via react-icons).
 * @param {number} rating — 1–5, decimals rounded (e.g. 4.8 → 5 filled)
 */
export default function StarRating({ rating, maxStars = 5, className = '', iconSize = 13 }) {
  const slots = getStarSlots(rating, maxStars);

  return (
    <span
      className={`star-rating ${className}`.trim()}
      role="img"
      aria-label={formatStarLabel(rating, maxStars)}
    >
      {slots.map((filled, index) =>
        filled ? (
          <FaStar
            key={index}
            className="star-rating__icon star-rating__icon--filled fas fa-star"
            size={iconSize}
            aria-hidden
          />
        ) : (
          <FaRegStar
            key={index}
            className="star-rating__icon star-rating__icon--empty far fa-star"
            size={iconSize}
            aria-hidden
          />
        ),
      )}
    </span>
  );
}
