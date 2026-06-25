import React from 'react';
import { FaStar } from 'react-icons/fa';

/** Compact rating: single star + numeric score (Explore grid). */
export default function ExploreRating({ rating }) {
  const value = Number(rating) || 0;
  return (
    <span className="ph-exp-rating" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      <FaStar size={12} className="ph-exp-rating__icon" aria-hidden />
      <span>{value.toFixed(1)}</span>
    </span>
  );
}
