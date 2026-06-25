import React from 'react';
import { resolveAdminChatAvatar } from './adminChatUtils';

const TABS = [
  { id: 'company_support', label: 'Company Support' },
  { id: 'user_candidate', label: 'User/Candidate Inbox' },
];

export default function AdminChatSidebar({
  channel,
  onChannelChange,
  threads,
  activeThreadKey,
  onSelectThread,
  loading,
}) {
  return (
    <aside className="admin-chat__sidebar">
      <div className="admin-chat__tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={channel === tab.id}
            className={`admin-chat__tab${channel === tab.id ? ' is-active' : ''}`}
            onClick={() => onChannelChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="admin-chat__thread-list">
        {loading ? <p className="admin-chat__hint">Loading threads…</p> : null}
        {!loading && !threads.length ? (
          <p className="admin-chat__hint">No active conversations yet.</p>
        ) : null}
        {threads.map((thread) => {
          const active = thread.thread_key === activeThreadKey;
          const avatar = resolveAdminChatAvatar(thread.imageurl, thread.entity_name);
          return (
            <button
              key={thread.thread_key}
              type="button"
              className={`admin-chat__thread${active ? ' is-active' : ''}`}
              onClick={() => onSelectThread(thread.thread_key)}
            >
              <img src={avatar} alt="" className="admin-chat__avatar" />
              <div className="admin-chat__thread-body">
                <div className="admin-chat__thread-top">
                  <strong>{thread.entity_name || thread.thread_key}</strong>
                  {thread.unread_count > 0 ? (
                    <span className="admin-chat__badge">{thread.unread_count}</span>
                  ) : null}
                </div>
                <p className="admin-chat__preview">{thread.preview || 'No messages yet'}</p>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
