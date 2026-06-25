import React from 'react';
import RecentPostRow from './RecentPostRow';

export default function RecentPostsTable({
  rows,
  loading,
  onViewAll,
  onPublish,
  onStatusChange,
  onDelete,
}) {
  return (
    <section className="um-card auto-recent-card">
      <div className="auto-recent-head">
        <h2 className="auto-card-title">Recent Posts</h2>
        <button type="button" className="um-btn um-btn--ghost auto-view-all" onClick={onViewAll}>
          View All
        </button>
      </div>
      <div className={`w-full overflow-x-auto${loading ? ' opacity-70' : ''}`}>
        <div className={`um-table-wrap${loading ? ' um-table-wrap--loading' : ''}`}>
          <table className="um-table min-w-[950px] w-full text-left">
            <thead>
              <tr>
                <th>POST</th>
                <th>PLATFORMS</th>
                <th>STATUS</th>
                <th>DATE</th>
                <th className="um-th-actions">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="um-table-empty">
                    {loading ? 'Loading posts…' : 'No posts yet. Create your first automation post.'}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <RecentPostRow
                    key={row.id}
                    row={row}
                    onPublish={onPublish}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="auto-recent-foot">
        <button type="button" className="um-btn um-btn--ghost" onClick={onViewAll}>
          View All Posts
        </button>
      </div>
    </section>
  );
}
