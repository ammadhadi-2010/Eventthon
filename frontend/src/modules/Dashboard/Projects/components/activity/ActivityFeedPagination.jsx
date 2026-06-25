import React, { useMemo } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

export default function ActivityFeedPagination({ page, totalPages, onPageChange }) {
  const pages = useMemo(() => buildPageList(page, totalPages), [page, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav className="ph-act-pagination" aria-label="Activity pages">
      <button
        type="button"
        className="ph-act-page-btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <FiChevronLeft size={16} />
      </button>
      {pages.map((p, index) =>
        p === '…' ? (
          <span key={`ellipsis-${index}`} className="ph-act-page-ellipsis">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`ph-act-page-num${page === p ? ' is-active' : ''}`}
            aria-current={page === p ? 'page' : undefined}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className="ph-act-page-btn"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <FiChevronRight size={16} />
      </button>
    </nav>
  );
}
