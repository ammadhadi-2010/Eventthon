import React from 'react';
import { Building2, Mail, MessageSquare, UserRound } from 'lucide-react';
import { formatChatTime, resolveAdminChatAvatar } from './adminChatUtils';

function displayName(thread) {
  return (
    thread?.profile_name ||
    thread?.entity_name ||
    thread?.company_name ||
    thread?.email ||
    thread?.thread_key ||
    'Conversation'
  );
}

export default function AdminChatDetails({ activeThread, messages = [], channel }) {
  if (!activeThread) {
    return (
      <aside className="admin-chat__details admin-chat__details--empty" aria-label="Conversation details">
        <p>Select a conversation to see contact details.</p>
      </aside>
    );
  }

  const name = displayName(activeThread);
  const presence = activeThread.online_status || (activeThread.is_online ? 'online' : 'offline');
  const avatar = resolveAdminChatAvatar(activeThread.imageurl, name);
  const channelLabel =
    activeThread.channel_label ||
    (channel === 'user_candidate' ? 'Member' : 'Company');
  const incoming = messages.filter((m) => m.direction !== 'outgoing').length;
  const outgoing = messages.filter((m) => m.direction === 'outgoing').length;

  return (
    <aside className="admin-chat__details" aria-label="Conversation details">
      <div className="admin-chat__details-hero">
        <img
          src={avatar}
          alt=""
          className="admin-chat__details-avatar"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = resolveAdminChatAvatar('', name);
          }}
        />
        <h3>{name}</h3>
        <p className={`admin-chat__presence is-${presence}`}>
          {presence === 'online' ? 'Online' : presence === 'away' ? 'Away' : 'Offline'}
        </p>
        <span className="admin-chat__details-chip">{channelLabel} support</span>
      </div>

      <dl className="admin-chat__details-list">
        {activeThread.email ? (
          <div>
            <dt>
              <Mail size={13} aria-hidden />
              Email
            </dt>
            <dd>{activeThread.email}</dd>
          </div>
        ) : null}
        {activeThread.company_name ? (
          <div>
            <dt>
              <Building2 size={13} aria-hidden />
              Company
            </dt>
            <dd>{activeThread.company_name}</dd>
          </div>
        ) : null}
        {activeThread.profile_name && activeThread.profile_name !== name ? (
          <div>
            <dt>
              <UserRound size={13} aria-hidden />
              Profile
            </dt>
            <dd>{activeThread.profile_name}</dd>
          </div>
        ) : null}
        {activeThread.country ? (
          <div>
            <dt>Location</dt>
            <dd>{activeThread.country}</dd>
          </div>
        ) : null}
        {activeThread.member_since ? (
          <div>
            <dt>Member since</dt>
            <dd>{formatChatTime(activeThread.member_since)}</dd>
          </div>
        ) : null}
        <div>
          <dt>
            <MessageSquare size={13} aria-hidden />
            Messages
          </dt>
          <dd>
            {activeThread.message_count || messages.length} total
            {Number(activeThread.unread_count) > 0
              ? ` · ${activeThread.unread_count} unread`
              : ''}
          </dd>
        </div>
        <div>
          <dt>In this view</dt>
          <dd>
            {incoming} from contact · {outgoing} from admin
          </dd>
        </div>
        {activeThread.last_at ? (
          <div>
            <dt>Last activity</dt>
            <dd>{formatChatTime(activeThread.last_at)}</dd>
          </div>
        ) : null}
      </dl>

    </aside>
  );
}
