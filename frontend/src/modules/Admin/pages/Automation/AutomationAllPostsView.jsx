import React from 'react';
import { ArrowLeft } from 'lucide-react';
import RecentPostsTable from './RecentPostsTable';

export default function AutomationAllPostsView({
  rows,
  total,
  page,
  loading,
  onBack,
  onPageChange,
  onPublish,
  onStatusChange,
  onDelete,
}) {
  const pageCount = Math.max(1, Math.ceil(total / 50));

  return (
    <div className="auto-all-view">
      <button type="button" className="auto-detail-back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Automation
      </button>
      <RecentPostsTable
        rows={rows}
        loading={loading}
        onViewAll={onBack}
        onPublish={onPublish}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
      <div className="jm-pagination">
        <span>
          Page {page} of {pageCount} · {total} posts total
        </span>
        <div className="um-header-actions">
          <button
            type="button"
            className="um-btn um-btn--ghost"
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            Previous
          </button>
          <button
            type="button"
            className="um-btn um-btn--ghost"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
