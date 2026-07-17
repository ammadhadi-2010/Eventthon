import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import useOutreachActivity from './useOutreachActivity';

function ActivityRow({ item, open, onToggle }) {
  const Icon = item.icon;
  return (
    <li className={`eo-activity-item${open ? ' eo-activity-item--open' : ''}`}>
      <button type="button" className="eo-activity-item__head" onClick={onToggle} aria-expanded={open}>
        <span className={`eo-activity-icon eo-activity-icon--${item.tone}`}>
          <Icon size={14} aria-hidden />
        </span>
        <span className="eo-activity-item__copy">
          <span className="eo-activity-item__text">
            {item.prefix} <strong>{item.highlight}</strong>
          </span>
          <span className="eo-activity-item__time">{item.time}</span>
        </span>
        <ChevronDown size={14} className="eo-activity-item__chev" aria-hidden />
      </button>
      {open ? <p className="eo-activity-item__detail">{item.detail}</p> : null}
    </li>
  );
}

export default function OutreachActivityFeed({ onViewAll, refreshKey = 0 }) {
  const [openId, setOpenId] = useState(null);
  const { rows, loading } = useOutreachActivity(refreshKey);

  return (
    <section className="eo-panel eo-widget">
      <header className="eo-widget__head">
        <h2 className="eo-widget__title">Activity Feed</h2>
        <button type="button" className="eo-link-btn" onClick={onViewAll}>
          View All
        </button>
      </header>
      {loading ? <p className="eo-empty">Loading activity…</p> : null}
      <ul className="eo-activity-list">
        {rows.map((item) => (
          <ActivityRow
            key={item.id}
            item={item}
            open={openId === item.id}
            onToggle={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
          />
        ))}
      </ul>
    </section>
  );
}
