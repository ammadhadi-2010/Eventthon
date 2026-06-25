import React from 'react';

const METRIC_CARDS = [
  { key: 'total', label: 'Total Reports', tone: 'indigo', icon: '📊' },
  { key: 'new', label: 'New Reports', tone: 'purple', icon: '✨' },
  { key: 'in_progress', label: 'In Progress', tone: 'blue', icon: '⚙️' },
  { key: 'resolved', label: 'Resolved', tone: 'green', icon: '✅' },
  { key: 'closed', label: 'Closed', tone: 'gray', icon: '🗂️' },
];

export default function BugReportsMetrics({ summary = {} }) {
  return (
    <section className="abr-metrics">
      {METRIC_CARDS.map((card) => (
        <article key={card.key} className={`abr-metric abr-metric--${card.tone}`}>
          <span className="abr-metric__icon" aria-hidden>
            {card.icon}
          </span>
          <div>
            <p>{card.label}</p>
            <strong>{summary[card.key] ?? 0}</strong>
          </div>
        </article>
      ))}
    </section>
  );
}
