import React, { useState } from 'react';
import { ACTIVITY_LOG_SEED, MY_POSTS_SEED } from './accountHubData';
import './account-hub.css';

const TABS = [
  { id: 'posts', label: 'My Posts' },
  { id: 'logs', label: 'Recent Activity Logs' },
];

export default function ManageActivity() {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <div className="account-hub">
      <h1 className="account-hub__title">Posts &amp; Activity</h1>
      <p className="account-hub__sub">Review your posts and a chronological log of actions in EventThon.</p>

      <div className="account-hub__tabs" role="tablist" aria-label="Activity filters">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`account-hub__tab${activeTab === tab.id ? ' is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="account-hub__card">
        {activeTab === 'posts' ? (
          <ul className="account-hub__log-list">
            {MY_POSTS_SEED.map((post) => (
              <li key={post.id} className="account-hub__log-item">
                <strong>{post.title}</strong>
                <span>{post.excerpt}</span>
                <time>{post.time}</time>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="account-hub__log-list">
            {ACTIVITY_LOG_SEED.map((entry) => (
              <li key={entry.id} className="account-hub__log-item">
                <strong>{entry.action}</strong>
                <span>{entry.target}</span>
                <time>{entry.time}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
