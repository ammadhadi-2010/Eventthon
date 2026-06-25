import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { buildPagerItems } from './explorePaginationUtils';

export default function ExplorePagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const items = buildPagerItems(page, totalPages);

  return (
    <nav className="ph-exp-pager" aria-label="Explore projects pagination">
      <button
        type="button"
        className="ph-exp-pager__arrow"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <FiChevronLeft size={18} />
      </button>
      {items.map((item, index) =>
        item === '...' ? (
          <span key={`gap-${index}`} className="ph-exp-pager__gap" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={`ph-exp-pager__num${item === page ? ' is-active' : ''}`}
            onClick={() => onPageChange(item)}
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        className="ph-exp-pager__arrow"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <FiChevronRight size={18} />
      </button>
    </nav>
  );
}
