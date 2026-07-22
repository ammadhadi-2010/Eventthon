import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function WalletPagination({ page, totalPages, totalCount, pageSize, setPage }) {
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <div className="wallet-pagination">
      <span className="wallet-pagination__info">
        Showing {start}–{end} of {totalCount}
      </span>
      <div className="wallet-pagination__controls">
        <button
          type="button"
          className="wallet-pagination__btn"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          aria-label="Previous page"
        >
          <FiChevronLeft size={16} />
        </button>
        <span className="wallet-pagination__page">Page {page} / {totalPages}</span>
        <button
          type="button"
          className="wallet-pagination__btn"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          aria-label="Next page"
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
