import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BUG_REPORTS_PANEL_PATH,
  formatBugReportAlertTitle,
  isBugReportAlert,
} from './adminBugAlertCard';

const toSectionTitle = (section) => {
  if (section === 'today') return 'Today';
  if (section === 'yesterday') return 'Yesterday';
  return 'Earlier';
};

const toTone = (category) => {
  if (category === 'bug_report') return 'bug';
  if (category === 'verification') return 'purple';
  if (category === 'company_signup') return 'blue';
  if (category === 'flagged') return 'amber';
  if (category === 'system') return 'green';
  if (category === 'support') return 'purple';
  return 'blue';
};

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

function AlertAvatar({ item }) {
  if (isBugReportAlert(item)) {
    return (
      <div className="alerts-avatar alerts-avatar--bug" aria-hidden>
        🐞
      </div>
    );
  }
  return <div className="alerts-avatar">{(item.title || 'A').charAt(0)}</div>;
}

export default function AdminAlertsTimeline({ items, onOpenAlert }) {
  const navigate = useNavigate();
  const grouped = items.reduce((acc, item) => {
    const section = item.section || 'earlier';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const orderedSections = ['today', 'yesterday', 'earlier'].filter((key) => grouped[key]?.length);

  if (!orderedSections.length) {
    return (
      <section className="alerts-timeline-wrap">
        <div className="alerts-empty-state">No enterprise alerts right now.</div>
      </section>
    );
  }

  const openAlert = (item) => {
    onOpenAlert?.(item);
    const target = isBugReportAlert(item) ? BUG_REPORTS_PANEL_PATH : item.action_url;
    if (target) navigate(target);
  };

  return (
    <section className="alerts-timeline-wrap">
      {orderedSections.map((sectionKey) => (
        <div key={sectionKey} className="alerts-timeline-block">
          <h3 className="alerts-timeline-heading">{toSectionTitle(sectionKey)}</h3>
          <div className="alerts-list">
            {grouped[sectionKey].map((item) => (
              <article
                key={item._id || `${item.title}-${item.created_at}`}
                className={`alerts-list-item tone-${toTone(item.category)} ${
                  isBugReportAlert(item) ? 'is-bug-report ' : ''
                }${item.is_read ? '' : 'is-unread'}`}
                onClick={() => openAlert(item)}
              >
                <AlertAvatar item={item} />
                <div className="alerts-item-content">
                  <p>
                    <strong>{formatBugReportAlertTitle(item)}</strong>
                  </p>
                  <span>{item.message}</span>
                </div>
                <div className="alerts-item-meta">
                  <small>{formatTime(item.created_at)}</small>
                  {!item.is_read ? <span className="alerts-unread-dot" /> : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
