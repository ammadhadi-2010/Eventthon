import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ACTIVITY_LOG_SEED } from './accountHubData';
import './account-hub.css';

export default function ManageActivity() {
  return (
    <div className="account-hub">
      <h1 className="account-hub__title">Posts &amp; Activity</h1>
      <p className="account-hub__sub">
        Manage your posts from your profile Activity tab. Recent account actions are listed below.
      </p>

      <section className="account-hub__card account-hub__card--cta">
        <h2 className="account-hub__section-title">My Posts</h2>
        <p className="account-hub__about">
          Create, edit, and filter published posts and articles on your profile page.
        </p>
        <Link to="/profile?tab=activity" className="account-hub__save account-hub__save--link">
          Open Profile Activity →
        </Link>
      </section>

      <section className="account-hub__card">
        <h2 className="account-hub__section-title">Recent Activity Logs</h2>
        <ul className="account-hub__log-list">
          {ACTIVITY_LOG_SEED.map((entry) => (
            <li key={entry.id} className="account-hub__log-item">
              <strong>{entry.action}</strong>
              <span>{entry.target}</span>
              <time>{entry.time}</time>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
