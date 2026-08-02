import React from 'react';

export default function ActivityTimeline({ items = [] }) {
  if (!items.length) {
    return (
      <section className="chs-card cops-timeline">
        <h5>Timeline</h5>
        <p className="cops-muted">Events appear as hiring progresses.</p>
      </section>
    );
  }
  return (
    <section className="chs-card cops-timeline">
      <h5>Timeline</h5>
      <ol className="cops-timeline__list">
        {items.map((ev) => (
          <li key={ev.id || `${ev.type}-${ev.createdAt}`}>
            <span className={`cops-dot cops-dot--${ev.type || 'stage'}`} />
            <div>
              <strong>{ev.label || ev.type}</strong>
              {ev.detail ? <p>{ev.detail}</p> : null}
              <small>{ev.createdAt ? new Date(ev.createdAt).toLocaleString() : ''}</small>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
