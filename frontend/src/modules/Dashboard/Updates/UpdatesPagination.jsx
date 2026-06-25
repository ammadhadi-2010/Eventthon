import React, { useMemo } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function buildPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default function UpdatesPagination({ page, totalPages, onPageChange }) {
  const pages = useMemo(() => buildPages(page, totalPages), [page, totalPages]);

  return (
    <nav className="upd-explorer__pagination" aria-label="Updates pagination">
      <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}>
        <FiChevronLeft />
      </button>
      {pages.map((entry, index) => (
        typeof entry === 'number' ? (
          <button
            key={`page-${entry}`}
            type="button"
            className={entry === page ? 'is-active' : ''}
            onClick={() => onPageChange(entry)}
          >
            {entry}
          </button>
        ) : (
          <span key={`gap-${index}`} className="upd-explorer__gap">...</span>
        )
      ))}
      <button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>
        <FiChevronRight />
      </button>
    </nav>
  );
}
