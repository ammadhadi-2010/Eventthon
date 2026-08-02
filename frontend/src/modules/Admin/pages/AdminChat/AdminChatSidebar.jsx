import React from 'react';
import { resolveAdminChatAvatar, formatChatTime } from './adminChatUtils';

const TABS = [
  { id: 'company_support', label: 'Company Support' },
  { id: 'user_candidate', label: 'User / Candidate' },
];

function displayName(thread) {
  return (
    thread?.profile_name ||
    thread?.entity_name ||
    thread?.company_name ||
    thread?.email ||
    thread?.thread_key ||
    'Unknown'
  );
}

export default function AdminChatSidebar({
  channel,
  onChannelChange,
  threads,
  allThreadCount = 0,
  activeThreadKey,
  onSelectThread,
  loading,
  query,
  onQueryChange,
  onlineOnly,
  onOnlineOnlyChange,
  unreadOnly,
  onUnreadOnlyChange,
  onRefresh,
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

      <div className="admin-chat__sidebar-tools">
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search name, email, message…"
          aria-label="Search conversations"
        />
        <div className="admin-chat__filters">
          <label>
            <input
              type="checkbox"
              checked={onlineOnly}
              onChange={(e) => onOnlineOnlyChange(e.target.checked)}
            />
            Online
          </label>
          <label>
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => onUnreadOnlyChange(e.target.checked)}
            />
            Unread
          </label>
          <button type="button" className="admin-chat__icon-btn" onClick={onRefresh} aria-label="Refresh">
            ↻
          </button>
        </div>
        <p className="admin-chat__count">
          {threads.length}
          {allThreadCount && allThreadCount !== threads.length ? ` / ${allThreadCount}` : ''} conversations
        </p>
      </div>

      <div className="admin-chat__thread-list">
        {loading ? <p className="admin-chat__hint">Loading threads…</p> : null}
        {!loading && !threads.length ? (
          <p className="admin-chat__hint">No conversations match this view.</p>
        ) : null}
        {threads.map((thread) => {
          const keyLow = String(activeThreadKey || '').toLowerCase();
          const active =
            thread.thread_key === activeThreadKey ||
            String(thread.canonical_key || '').toLowerCase() === keyLow ||
            (thread.identity_keys || []).some((k) => String(k).toLowerCase() === keyLow);
          const name = displayName(thread);
          const avatar = resolveAdminChatAvatar(thread.imageurl, name);
          const presence = thread.online_status || (thread.is_online ? 'online' : 'offline');
          const subtitle = thread.company_name && thread.profile_name && thread.company_name !== thread.profile_name
            ? thread.company_name
            : (thread.email || thread.thread_key || '');
          return (
            <button
              key={thread.canonical_key || thread.thread_key}
              type="button"
              className={`admin-chat__thread${active ? ' is-active' : ''}`}
              onClick={() => onSelectThread(thread.thread_key)}
            >
              <span className="admin-chat__avatar-wrap">
                <img src={avatar} alt="" className="admin-chat__avatar" />
                <i className={`admin-chat__dot is-${presence}`} aria-hidden />
              </span>
              <div className="admin-chat__thread-body">
                <div className="admin-chat__thread-top">
                  <strong title={name}>{name}</strong>
                  {thread.unread_count > 0 ? (
                    <span className="admin-chat__badge">{thread.unread_count}</span>
                  ) : null}
                </div>
                {subtitle ? <em className="admin-chat__subtitle">{subtitle}</em> : null}
                <p className="admin-chat__preview">{thread.preview || 'No messages yet'}</p>
                <div className="admin-chat__thread-meta">
                  <small className={`admin-chat__presence is-${presence}`}>
                    {presence === 'online' ? 'Online' : presence === 'away' ? 'Away' : 'Offline'}
                  </small>
                  {thread.message_count ? (
                    <small>{thread.message_count} msgs</small>
                  ) : null}
                  {thread.last_at ? <small>{formatChatTime(thread.last_at)}</small> : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
