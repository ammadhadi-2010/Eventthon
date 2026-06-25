import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ViewAllListFooter({
  from,
  to,
  totalAll,
  footerNoun,
  totalPages,
  safePage,
  pageNumbers,
  onPageChange,
}) {
  return (
    <footer className="pnet-footer">
      <span className="pnet-footer__summary">
        Showing {from} to {to} of {Number(totalAll).toLocaleString()} {footerNoun}
      </span>
      {totalPages > 1 ? (
        <nav className="pnet-footer__pager" aria-label="Pagination">
          <button
            type="button"
            className="pnet-pager__arrow"
            disabled={safePage <= 1}
            onClick={() => onPageChange((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          {pageNumbers.map((n) => (
            <button
              key={n}
              type="button"
              className={`pnet-pager__num${n === safePage ? ' is-active' : ''}`}
              onClick={() => onPageChange(n)}
              aria-current={n === safePage ? 'page' : undefined}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className="pnet-pager__arrow"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
          >
            <ChevronRight size={18} strokeWidth={2} />
          </button>
        </nav>
      ) : null}
    </footer>
  );
}
