import React from 'react';
import { MATCH_FREQUENCIES } from '../createJobAlertConstants';

export default function JobAlertStepNotifications({ form, patch }) {
  return (
    <section className="ja-panel" aria-labelledby="ja-step-notifications-title">
      <h2 id="ja-step-notifications-title" className="ja-panel__title">
        Notifications
      </h2>
      <p className="ja-panel__sub">Choose how often you want to hear about new matches.</p>

      <div className="ja-field">
        <span className="ja-label">Alert Frequency</span>
        <div className="ja-chips">
          {MATCH_FREQUENCIES.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`ja-chip${form.alertFrequency === opt ? ' is-active' : ''}`}
              onClick={() => patch({ alertFrequency: opt })}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <label className="ja-field">
        <span className="ja-label">Notification Email</span>
        <input
          type="email"
          className="ja-input"
          placeholder="you@company.com"
          value={form.notificationEmail}
          onChange={(e) => patch({ notificationEmail: e.target.value })}
          autoComplete="email"
        />
      </label>

      <p className="ja-hint">
        Email, in-app, and weekly summary toggles are in the preview panel on the right.
        Continue to step 6 for the full job preview.
      </p>
    </section>
  );
}
