import React, { useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { formatChatTime } from './adminChatUtils';

export default function AdminChatPanel({
  activeThread,
  messages,
  draft,
  onDraftChange,
  onSend,
  loading,
  sending,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, activeThread?.thread_key]);

  if (!activeThread) {
    return (
      <section className="admin-chat__panel admin-chat__panel--empty">
        <p>Select a conversation to start messaging.</p>
      </section>
    );
  }

  return (
    <section className="admin-chat__panel">
      <header className="admin-chat__panel-head">
        <h2>{activeThread.entity_name || activeThread.thread_key}</h2>
        <span className="admin-chat__panel-meta">{activeThread.thread_key}</span>
      </header>
      <div className="admin-chat__messages" ref={scrollRef}>
        {loading ? <p className="admin-chat__hint">Loading messages…</p> : null}
        {!loading && !messages.length ? (
          <p className="admin-chat__hint">No messages in this thread yet.</p>
        ) : null}
        {messages.map((msg) => (
          <div
            key={msg.id || `${msg.created_at}-${msg.body}`}
            className={`admin-chat__bubble-row${msg.direction === 'outgoing' ? ' is-out' : ' is-in'}`}
          >
            <div className="admin-chat__bubble">
              <p>{msg.body}</p>
              <time>{formatChatTime(msg.created_at)}</time>
            </div>
          </div>
        ))}
      </div>
      <form
        className="admin-chat__composer"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder="Type a message to send instantly…"
          disabled={sending}
        />
        <button type="submit" disabled={sending || !draft.trim()} aria-label="Send message">
          <Send size={16} />
          Send
        </button>
      </form>
    </section>
  );
}
