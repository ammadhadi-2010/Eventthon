import React from 'react';
import { AUTOMATION_PLATFORMS, STATUS_CLASS, postPlaceholder, resolvePostImageurl } from './automationData';
import AutomationRowMenu from './AutomationRowMenu';

function PlatformIcons({ ids = [] }) {
  const map = AUTOMATION_PLATFORMS.reduce((acc, p) => ({ ...acc, [p.id]: p.short }), {});
  return (
    <div className="auto-platform-icons">
      {ids.map((id) => (
        <span key={id} className="auto-platform-icon" title={id}>
          {map[id] || id.slice(0, 2).toUpperCase()}
        </span>
      ))}
    </div>
  );
}

export default function RecentPostRow({ row, onPublish, onStatusChange, onDelete }) {
  const img = resolvePostImageurl(row) || postPlaceholder(row.title);
  const statusLabel = row.status ? row.status.toUpperCase() : 'PENDING';

  return (
    <tr>
      <td>
        <div className="auto-post-cell">
          <img src={img} alt="" className="auto-post-thumb" />
          <div className="min-w-0">
            <p className="auto-post-title">{row.title}</p>
            <p className="auto-post-desc">{row.description || row.caption}</p>
          </div>
        </div>
      </td>
      <td><PlatformIcons ids={row.platforms} /></td>
      <td>
        <span className={`um-status-chip ${STATUS_CLASS[row.status] || ''}`}>{statusLabel}</span>
      </td>
      <td className="um-td-muted">{row.postedLabel}</td>
      <td className="um-th-actions">
        <AutomationRowMenu
          row={row}
          onPublish={onPublish}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}
