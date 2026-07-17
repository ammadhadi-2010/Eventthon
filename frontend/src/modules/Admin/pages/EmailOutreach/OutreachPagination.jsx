import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function OutreachPagination({ page, totalPages, pageSize, totalItems, onPageChange }) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const pages = [];
  const windowSize = 5;
  let from = Math.max(1, page - 2);
  let to = Math.min(totalPages, from + windowSize - 1);
  if (to - from < windowSize - 1) from = Math.max(1, to - windowSize + 1);
  for (let i = from; i <= to; i += 1) pages.push(i);

  return (
    <footer className="eo-pagination">
      <p className="eo-pagination__info">
        Showing <strong>{start}</strong> to <strong>{end}</strong> of{' '}
        <strong>{totalItems.toLocaleString()}</strong> leads
      </p>
      <div className="eo-pagination__controls">
        <button
          type="button"
          className="eo-page-nav"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`eo-page-btn${p === page ? ' eo-page-btn--active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          className="eo-page-nav"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </footer>
  );
}
