import React, { useEffect, useRef, useState } from 'react';
import { Copy, MoreHorizontal, Paperclip, Image as ImageIcon, RefreshCw, Send } from 'lucide-react';
import { formatChatTime, resolveAdminChatAvatar } from './adminChatUtils';
import { resolveMediaUrl } from '../../../../components/shared/utils/resolveMediaUrl';

const FILE_ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.png,.jpg,.jpeg,.webp,.gif,.mp4,.webm,.mov,.txt';

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

function deliveryTick(status) {
  const key = String(status || 'sent').toLowerCase();
  if (key === 'failed') return '⚠';
  if (key === 'sending') return '…';
  if (key === 'read' || key === 'seen') return '✓✓';
  if (key === 'delivered') return '✓✓';
  return '✓';
}

function parseReplyQuote(body) {
  const text = String(body || '');
  const match = text.match(/^Reply:\s*"([^"]+)"\s*(.*)$/is);
  if (!match) return null;
  return { quote: match[1].trim(), rest: match[2].trim() };
}

function isImageAttachment(item) {
  const type = String(item?.type || item?.kind || '').toLowerCase();
  const name = String(item?.name || item?.url || item?.imageurl || '').toLowerCase();
  if (type.includes('image')) return true;
  return /\.(png|jpe?g|webp|gif)$/i.test(name);
}

function attachmentUrl(item) {
  return resolveMediaUrl(item?.url || item?.imageurl || '') || '';
}

export default function AdminChatPanel({
  activeThread,
  messages,
  draft,
  onDraftChange,
  onSend,
  loading,
  sending,
  uploading,
  quickReplies = [],
  onRefresh,
  pendingAttachments = [],
  onPickFiles,
  onRemovePendingAttachment,
  onCopyEmail,
  onToggleLike,
}) {
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuNotice, setMenuNotice] = useState('');

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, activeThread?.thread_key]);

  useEffect(() => {
    inputRef.current?.focus();
    setMenuOpen(false);
    setMenuNotice('');
  }, [activeThread?.thread_key]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  if (!activeThread) {
    return (
      <section className="admin-chat__panel admin-chat__panel--empty">
        <p>Select a conversation to start messaging.</p>
      </section>
    );
  }

  const name = displayName(activeThread);
  const presence = activeThread.online_status || (activeThread.is_online ? 'online' : 'offline');
  const avatar = resolveAdminChatAvatar(activeThread.imageurl, name);
  const subtitle = activeThread.email || activeThread.thread_key || '';
  const canSend = Boolean(draft.trim() || pendingAttachments.length) && !sending && !uploading;

  const handleMenu = async (action) => {
    setMenuOpen(false);
    if (action === 'refresh') {
      onRefresh?.();
      return;
    }
    if (action === 'copy_email') {
      const ok = await onCopyEmail?.();
      setMenuNotice(ok ? 'Email copied' : 'No email to copy');
      window.setTimeout(() => setMenuNotice(''), 1800);
    }
  };

  return (
    <section className="admin-chat__panel">
      <header className="admin-chat__panel-head">
        <div className="admin-chat__panel-identity">
          <img
            src={avatar}
            alt=""
            className="admin-chat__panel-avatar"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = resolveAdminChatAvatar('', name);
            }}
          />
          <div>
            <h2>{name}</h2>
            <p className="admin-chat__panel-sub">
              <span className={`admin-chat__panel-meta is-${presence}`}>
                {presence === 'online' ? 'Online' : presence === 'away' ? 'Away' : 'Offline'}
              </span>
              {subtitle ? (
                <>
                  <span aria-hidden>·</span>
                  <span>{subtitle}</span>
                </>
              ) : null}
              {activeThread.company_name && activeThread.company_name !== name ? (
                <>
                  <span aria-hidden>·</span>
                  <span>{activeThread.company_name}</span>
                </>
              ) : null}
              <span aria-hidden>·</span>
              <span>{messages.length} messages</span>
            </p>
          </div>
        </div>
        <div className="admin-chat__panel-actions">
          <button type="button" className="admin-chat__icon-btn" onClick={onRefresh} aria-label="Refresh chat" title="Refresh">
            <RefreshCw size={15} />
          </button>
          <div className="admin-chat__more" ref={menuRef}>
            <button
              type="button"
              className="admin-chat__icon-btn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More options"
              aria-expanded={menuOpen}
            >
              <MoreHorizontal size={16} />
            </button>
            {menuOpen ? (
              <div className="admin-chat__more-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => handleMenu('refresh')}>
                  Refresh conversation
                </button>
                <button type="button" role="menuitem" onClick={() => handleMenu('copy_email')}>
                  <Copy size={13} aria-hidden />
                  Copy email
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      {menuNotice ? <p className="admin-chat__menu-notice">{menuNotice}</p> : null}

      <div className="admin-chat__messages" ref={scrollRef}>
        {loading && !messages.length ? <p className="admin-chat__hint">Loading full conversation…</p> : null}
        {!loading && !messages.length ? (
          <p className="admin-chat__hint">No messages in this thread yet. Send the first reply below.</p>
        ) : null}
        {messages.map((msg, idx) => {
          const delivery = String(msg.delivery_status || msg.status || 'sent').toLowerCase();
          const outgoing = msg.direction === 'outgoing';
          const senderName = outgoing ? 'EventThon Admin' : (msg.from_user_name || name);
          const recipientName = outgoing ? name : 'EventThon Admin';
          // Incoming: company/user face before bubble. Outgoing: recipient face after bubble.
          const faceUrl = outgoing
            ? resolveAdminChatAvatar(
              msg.to_user_imageurl || msg.peer_imageurl || activeThread.imageurl,
              recipientName,
            )
            : resolveAdminChatAvatar(
              msg.from_user_imageurl || activeThread.imageurl,
              senderName,
            );
          const faceTitle = outgoing ? `To: ${recipientName}` : senderName;
          const replyParts = !outgoing ? parseReplyQuote(msg.body) : null;
          const attachments = Array.isArray(msg.attachments) ? msg.attachments : [];
          const bodyText = String(msg.body || '').trim();
          const hideBody = !bodyText || /^attachment$/i.test(bodyText);
          return (
            <div
              key={msg.id || `${msg.created_at}-${idx}`}
              className={`admin-chat__bubble-row${outgoing ? ' is-out' : ' is-in'}`}
            >
              {!outgoing ? (
                <img
                  src={faceUrl}
                  alt=""
                  className="admin-chat__msg-avatar"
                  title={faceTitle}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = resolveAdminChatAvatar('', senderName);
                  }}
                />
              ) : null}
              <div className="admin-chat__bubble">
                <span className="admin-chat__bubble-from">
                  {outgoing ? `To ${recipientName}` : senderName}
                </span>
                {replyParts ? (
                  <>
                    <blockquote className="admin-chat__reply-quote">
                      <span>Replying to</span>
                      {replyParts.quote}
                    </blockquote>
                    {replyParts.rest ? <p>{replyParts.rest}</p> : null}
                  </>
                ) : (
                  !hideBody ? <p>{bodyText}</p> : null
                )}
                {attachments.length ? (
                  <div className="admin-chat__attachments">
                    {attachments.map((item, aidx) => {
                      const url = attachmentUrl(item);
                      const itemName = item?.name || `attachment-${aidx + 1}`;
                      if (isImageAttachment(item) && url) {
                        return (
                          <a
                            key={`${msg.id}-a-${aidx}`}
                            className="admin-chat__attach-image"
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img src={url} alt={itemName} />
                          </a>
                        );
                      }
                      return (
                        <a
                          key={`${msg.id}-a-${aidx}`}
                          className="admin-chat__attach-file"
                          href={url || '#'}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {itemName}
                        </a>
                      );
                    })}
                  </div>
                ) : null}
                <div className="admin-chat__bubble-meta">
                  <time>
                    {formatChatTime(msg.created_at)}
                    {outgoing ? (
                      <span className={`admin-chat__ticks is-${delivery}`}>{deliveryTick(delivery)}</span>
                    ) : null}
                  </time>
                  <button
                    type="button"
                    className={`admin-chat__like-btn${msg.liked ? ' is-on' : ''}`}
                    onClick={() => onToggleLike?.(msg.id)}
                    aria-label={msg.liked ? 'Unlike message' : 'Like message'}
                    title={msg.liked ? 'Unlike' : 'Like'}
                  >
                    👍 {msg.likes || 0}
                  </button>
                </div>
              </div>
              {outgoing ? (
                <img
                  src={faceUrl}
                  alt=""
                  className="admin-chat__msg-avatar"
                  title={faceTitle}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = resolveAdminChatAvatar('', recipientName);
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {quickReplies.length ? (
        <div className="admin-chat__quick">
          {quickReplies.map((text) => (
            <button key={text} type="button" onClick={() => onSend(text)} disabled={sending || uploading}>
              {text}
            </button>
          ))}
        </div>
      ) : null}

      {pendingAttachments.length ? (
        <div className="admin-chat__pending">
          {pendingAttachments.map((item, idx) => (
            <span key={`${item?.url || item?.name}-${idx}`} className="admin-chat__pending-chip">
              {item?.name || `file-${idx + 1}`}
              <button type="button" onClick={() => onRemovePendingAttachment(idx)} aria-label="Remove attachment">
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <form
        className="admin-chat__composer"
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
      >
        <input
          ref={fileInputRef}
          className="admin-chat__hidden-input"
          type="file"
          multiple
          accept={FILE_ACCEPT}
          onChange={(e) => {
            onPickFiles?.(e.target.files, 'file');
            e.target.value = '';
          }}
        />
        <input
          ref={imageInputRef}
          className="admin-chat__hidden-input"
          type="file"
          multiple
          accept="image/*,video/*,.gif"
          onChange={(e) => {
            onPickFiles?.(e.target.files, 'image');
            e.target.value = '';
          }}
        />
        <div className="admin-chat__compose-tools">
          <button
            type="button"
            className="admin-chat__tool-btn"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach file"
            disabled={sending || uploading}
            title="Attach file"
          >
            <Paperclip size={16} />
          </button>
          <button
            type="button"
            className="admin-chat__tool-btn"
            onClick={() => imageInputRef.current?.click()}
            aria-label="Attach image"
            disabled={sending || uploading}
            title="Attach image"
          >
            <ImageIcon size={16} />
          </button>
        </div>
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={uploading ? 'Uploading…' : 'Reply as EventThon Admin… (Enter to send, Shift+Enter for new line)'}
          disabled={sending}
          rows={2}
        />
        <button type="submit" disabled={!canSend} aria-label="Send message">
          <Send size={16} />
          Send
        </button>
      </form>
    </section>
  );
}
