import React from 'react';
import { FiActivity, FiDatabase, FiServer } from 'react-icons/fi';

const TONE_ICON = {
  green: FiServer,
  blue: FiDatabase,
  purple: FiActivity,
  amber: FiActivity,
};

export default function AdminProfileActivityFeed({ items = [], loading }) {
  if (loading) {
    return <p className="ap-feed-empty">Loading system activity feed...</p>;
  }

  if (!items.length) {
    return <p className="ap-feed-empty">No system activity logs available.</p>;
  }

  return (
    <section className="ap-feed-wrap">
      <h4 className="ap-feed-title">System Activity Feed</h4>
      <div className="ap-feed-list">
        {items.map((item) => {
          const Icon = TONE_ICON[item.tone] || FiActivity;
          return (
            <article key={item.id} className={`ap-feed-item ap-feed-item--${item.tone || 'blue'}`}>
              <div className="ap-feed-item__head">
                <span className="ap-feed-item__icon">
                  <Icon size={14} aria-hidden />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.time_label || 'Recently'}</small>
                </div>
              </div>
              <p>{item.message}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
