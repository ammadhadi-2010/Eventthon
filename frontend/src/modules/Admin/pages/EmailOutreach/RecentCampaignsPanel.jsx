import React from 'react';
import { RECENT_CAMPAIGNS } from './outreachDashboardData';

export default function RecentCampaignsPanel({ onOpenComposer }) {
  return (
    <section className="eo-panel eo-dash-panel">
      <header className="eo-dash-panel__head">
        <h2 className="eo-dash-panel__title">Recent Campaigns</h2>
        <button type="button" className="eo-link-btn" onClick={onOpenComposer}>
          New campaign
        </button>
      </header>

      <ul className="eo-campaign-list">
        {RECENT_CAMPAIGNS.map((item) => (
          <li key={item.id} className="eo-campaign-item">
            <div className="eo-campaign-item__top">
              <div>
                <p className="eo-campaign-item__name">{item.name}</p>
                <p className="eo-campaign-item__meta">{item.sent} emails sent · {item.status}</p>
              </div>
              <span className="eo-campaign-item__pct">{item.progress}%</span>
            </div>
            <div className="eo-progress">
              <span className="eo-progress__bar" style={{ width: `${item.progress}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
