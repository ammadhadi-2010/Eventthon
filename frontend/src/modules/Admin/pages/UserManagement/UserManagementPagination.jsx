import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function UserManagementPagination({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
}) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const pages = [];
  const windowSize = 5;
  let from = Math.max(1, page - 2);
  let to = Math.min(totalPages, from + windowSize - 1);
  if (to - from < windowSize - 1) from = Math.max(1, to - windowSize + 1);
  for (let i = from; i <= to; i += 1) pages.push(i);

  return (
    <div className="um-pagination flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="um-pagination-info">
        Showing <strong>{start}</strong> to <strong>{end}</strong> of{' '}
        <strong>{totalItems.toLocaleString()}</strong> users
      </p>
      <div className="um-pagination-pages">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="um-page-nav"
          aria-label="Previous page"
        >
          <ChevronLeft size={15} />
        </button>
        {from > 1 ? (
          <>
            <PageBtn label={1} active={page === 1} onClick={() => onPageChange(1)} />
            {from > 2 ? <span className="um-page-ellipsis">…</span> : null}
          </>
        ) : null}
        {pages.map((p) => (
          <PageBtn key={p} label={p} active={p === page} onClick={() => onPageChange(p)} />
        ))}
        {to < totalPages ? (
          <>
            {to < totalPages - 1 ? <span className="um-page-ellipsis">…</span> : null}
            <PageBtn
              label={totalPages}
              active={page === totalPages}
              onClick={() => onPageChange(totalPages)}
            />
          </>
        ) : null}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="um-page-nav"
          aria-label="Next page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function PageBtn({ label, active, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`um-page-btn ${active ? 'um-page-btn--active' : ''}`}>
      {label}
    </button>
  );
}
