import React, { useState } from 'react';
import { ChevronDown, Mail, RefreshCw } from 'lucide-react';
import useOutreachReplies from './useOutreachReplies';

function ReplyRow({ item, open, onToggle, compact = false }) {
  const preview = (item.bodyContent || '').replace(/\s+/g, ' ').trim();
  const shortPreview = preview.length > 140 ? `${preview.slice(0, 140)}…` : preview;
  return (
    <li className={`eo-reply-item${open ? ' eo-reply-item--open' : ''}`}>
      <button type="button" className="eo-reply-item__head" onClick={onToggle} aria-expanded={open}>
        <span className="eo-reply-icon">
          <Mail size={14} aria-hidden />
        </span>
        <span className="eo-reply-item__copy">
          <span className="eo-reply-item__title">
            <strong>{item.senderName}</strong>
            <span className="eo-reply-item__email">{item.senderEmail}</span>
          </span>
          <span className="eo-reply-item__subject">
            {item.subject}
            {item.status === 'ai_replied' ? <span className="eo-reply-badge--ai">AI Replied</span> : null}
          </span>
          {!open && compact ? <span className="eo-reply-item__preview">{shortPreview}</span> : null}
          <span className="eo-reply-item__time">{item.receivedAt}</span>
        </span>
        <ChevronDown size={14} className="eo-reply-item__chev" aria-hidden />
      </button>
      {open ? (
        <>
          <p className="eo-reply-item__body">{item.bodyContent || 'No message body.'}</p>
          {item.aiReplyBody ? (
            <p className="eo-reply-item__ai-body">
              <strong>AI Auto-Pilot:</strong>
              {'\n'}
              {item.aiReplyBody}
            </p>
          ) : null}
        </>
      ) : null}
    </li>
  );
}

export default function OutreachRepliesPanel({
  leadId = '',
  limit = 8,
  compact = true,
  refreshKey = 0,
  title = 'Inbox Replies',
}) {
  const [openId, setOpenId] = useState(null);
  const { replies, loading, syncing, error, syncNow } = useOutreachReplies({ leadId, limit, refreshKey });

  return (
    <section className="eo-panel eo-widget eo-replies-panel">
      <header className="eo-widget__head">
        <h2 className="eo-widget__title">{title}</h2>
        <button type="button" className="eo-link-btn" onClick={syncNow} disabled={syncing}>
          <RefreshCw size={13} aria-hidden />
          {syncing ? 'Syncing…' : 'Sync Inbox'}
        </button>
      </header>
      {loading ? <p className="eo-reply-status">Loading replies…</p> : null}
      {error ? <p className="eo-reply-status eo-reply-status--error">{error}</p> : null}
      {!loading && !replies.length ? (
        <p className="eo-reply-status">No replies yet. New responses to eventthon@gmail.com will appear here automatically.</p>
      ) : null}
      <ul className="eo-reply-list">
        {replies.map((item) => (
          <ReplyRow
            key={item.id}
            item={item}
            compact={compact}
            open={openId === item.id}
            onToggle={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
          />
        ))}
      </ul>
    </section>
  );
}
