import React from 'react';

const STATUS_CLASS = {
  Completed: 'um-status--active',
  'In Progress': 'um-status--pending',
  Pending: 'um-status--unverified',
  Done: 'um-status--active',
};

export default function GigMilestonesTab({ milestones = [], onStatusChange }) {
  if (!milestones.length) {
    return <p className="gp-empty">No milestones configured.</p>;
  }

  return (
    <div className="gm-list">
      {milestones.map((m) => (
        <article key={m.id} className="gm-card">
          <div>
            <h4>{m.title}</h4>
            <p>Due: {m.dueDate}</p>
          </div>
          <div className="gm-card__right">
            <strong>{m.amount}</strong>
            <select
              className="gm-status-select"
              value={m.status}
              onChange={(e) => onStatusChange?.(m.id, e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </article>
      ))}
    </div>
  );
}
