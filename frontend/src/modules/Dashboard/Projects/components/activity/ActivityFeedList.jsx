import React from 'react';
import {
  FiCheckSquare,
  FiFlag,
  FiMessageSquare,
  FiRefreshCw,
} from 'react-icons/fi';

const TYPE_ICONS = {
  updates: FiRefreshCw,
  tasks: FiCheckSquare,
  comments: FiMessageSquare,
  milestones: FiFlag,
};

export default function ActivityFeedList({ items }) {
  if (!items.length) {
    return (
      <div className="ph-act-empty" role="status">
        No activities match your filters.
      </div>
    );
  }

  return (
    <ul className="ph-act-list">
      {items.map((item) => {
        const Icon = TYPE_ICONS[item.type] || FiRefreshCw;
        return (
          <li key={item.id} className="ph-act-row">
            <span
              className="ph-act-row-icon"
              style={{ background: `${item.tone}22`, color: item.tone, borderColor: `${item.tone}55` }}
              aria-hidden
            >
              <Icon size={16} />
            </span>
            <div className="ph-act-row-body">
              <strong className="ph-act-row-project">{item.project}</strong>
              <p className="ph-act-row-action">{item.action}</p>
              {item.detail ? <p className="ph-act-row-detail">{item.detail}</p> : null}
            </div>
            <div className="ph-act-row-meta">
              <time dateTime={item.time}>{item.time}</time>
              <span className="ph-act-row-dot" aria-hidden />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
