import React, { useState } from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa';

export default function StarRatingInput({ value = 0, onChange, maxStars = 5, className = '' }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div
      className={`star-rating-input ${className}`.trim()}
      role="group"
      aria-label="Star rating"
      onMouseLeave={() => setHover(0)}
    >
      {Array.from({ length: maxStars }, (_, i) => {
        const star = i + 1;
        const filled = star <= display;
        return (
          <button
            key={star}
            type="button"
            className={`star-rating-input__btn${filled ? ' is-filled' : ''}`}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
            aria-pressed={value === star}
            onMouseEnter={() => setHover(star)}
            onFocus={() => setHover(star)}
            onBlur={() => setHover(0)}
            onClick={() => onChange(star)}
          >
            {filled ? <FaStar size={22} aria-hidden /> : <FaRegStar size={22} aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}
