import React, { useMemo, useState } from 'react';
import { FiFile, FiMoreHorizontal } from 'react-icons/fi';
import { formatClock } from '../../utils/messagesFormat';
import { deliveryLabel, deliveryTicks } from '../companyOps/conversationOps';

const PLACEHOLDER_TEXT = new Set(['', 'attachment']);
const URL_RE = /(https?:\/\/[^\s<]+)/gi;

function shouldShowText(text, hasAttachments) {
  const normalized = String(text || '').trim().toLowerCase();
  if (!normalized) return false;
  if (PLACEHOLDER_TEXT.has(normalized) && hasAttachments) return false;
  return true;
}

function resolveAttachmentUrl(item, toAbsoluteUrl) {
  const raw = String(item?.imageurl || item?.url || item?.src || '').trim();
  if (!raw) return '';
  return toAbsoluteUrl?.(raw) || raw;
}

function isImageAttachment(item, itemUrl) {
  const itemType = String(item?.type || item?.kind || item?.mime || '').toLowerCase();
  const itemName = String(item?.name || '').toLowerCase();
  if (itemType.includes('image') || itemType === 'gif' || itemType.startsWith('image/')) return true;
  if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(itemUrl || itemName)) return true;
  // Uploaded chat images often live under /static/uploads/messages/<hash>.png
  if (/\/static\/uploads\/messages\//i.test(itemUrl) && /\.(png|jpe?g|gif|webp|bmp)(\?|$)/i.test(itemUrl)) {
    return true;
  }
  return false;
}

function parseContent(text) {
  const raw = String(text || '');
  const codeMatch = raw.match(/```([\s\S]*?)```/);
  if (codeMatch) {
    const before = raw.slice(0, codeMatch.index).trim();
    const code = codeMatch[1].replace(/^\n/, '');
    const after = raw.slice(codeMatch.index + codeMatch[0].length).trim();
    return { before, code, after, links: [] };
  }
  const links = raw.match(URL_RE) || [];
  return { before: raw, code: '', after: '', links };
}

const ChatMessageBubble = ({
  msg,
  toAbsoluteUrl,
  onOpenMessageMenu,
  onToggleLike,
  richStatus = false,
}) => {
  const [brokenImages, setBrokenImages] = useState({});
  const attachments = Array.isArray(msg.attachments) ? msg.attachments : [];
  const hasAttachments = attachments.length > 0;
  const isMediaOnly = hasAttachments && !shouldShowText(msg.text, hasAttachments);
  const parsed = useMemo(() => parseContent(msg.text), [msg.text]);

  return (
    <div className={`msgx-bubble-row ${msg.sender === 'seller' ? 'is-left' : 'is-right'}`}>
      <div
        className={`msgx-bubble${isMediaOnly ? ' msgx-bubble--media-only' : ''}`}
        onContextMenu={(event) => onOpenMessageMenu(event, msg.id)}
      >
        <button
          type="button"
          className="msgx-bubble-more"
          onClick={(event) => onOpenMessageMenu(event, msg.id)}
          aria-label="Message options"
        >
          <FiMoreHorizontal size={13} />
        </button>

        {shouldShowText(msg.text, hasAttachments) ? (
          <>
            {parsed.before ? <p className="msgx-bubble-text">{parsed.before}</p> : null}
            {parsed.code ? (
              <pre className="msgx-bubble-code"><code>{parsed.code}</code></pre>
            ) : null}
            {parsed.after ? <p className="msgx-bubble-text">{parsed.after}</p> : null}
            {parsed.links.slice(0, 2).map((href) => {
              let host = href;
              try { host = new URL(href).hostname; } catch { /* keep */ }
              return (
                <a key={href} className="msgx-link-preview" href={href} target="_blank" rel="noreferrer">
                  <strong>Link preview</strong>
                  <span>{host}</span>
                </a>
              );
            })}
          </>
        ) : null}

        {hasAttachments ? (
          <div className="msgx-attachments">
            {attachments.map((item, idx) => {
              const itemUrl = resolveAttachmentUrl(item, toAbsoluteUrl);
              const itemName = item?.name || `attachment-${idx + 1}`;
              const itemType = String(item?.type || item?.kind || 'file').toLowerCase();

              if (isImageAttachment(item, itemUrl) && itemUrl && !brokenImages[idx]) {
                return (
                  <a
                    key={`${msg.id}-att-${idx}`}
                    className="msgx-attach-image"
                    href={itemUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={itemUrl}
                      alt={itemName}
                      onError={() => setBrokenImages((prev) => ({ ...prev, [idx]: true }))}
                    />
                  </a>
                );
              }
              if ((itemType.includes('audio') || itemType.includes('voice')) && itemUrl) {
                return (
                  <div key={`${msg.id}-att-${idx}`} className="msgx-attach-audio">
                    <audio controls src={itemUrl} />
                  </div>
                );
              }
              return (
                <a
                  key={`${msg.id}-att-${idx}`}
                  className="msgx-attach-file-card"
                  href={itemUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FiFile size={14} aria-hidden />
                  <span>
                    <strong>{itemName}</strong>
                    <em>{(itemType || 'file').toUpperCase()}</em>
                  </span>
                </a>
              );
            })}
          </div>
        ) : null}

        {msg.replyTo ? (
          <div className="msgx-reply-chip">
            Reply to {msg.replyTo.sender === 'seller' ? 'Seller' : 'You'}: {msg.replyTo.text}
          </div>
        ) : null}

        <div className="msgx-bubble-meta">
          <small>{formatClock(msg.time)}</small>
          {msg.sender !== 'seller' ? (
            <small className={`msgx-ticks is-${msg.delivery || 'sent'}`}>
              {deliveryTicks(msg.delivery)}
              {richStatus ? (
                <span className="msgx-delivery-label">{deliveryLabel(msg.delivery)}</span>
              ) : null}
            </small>
          ) : null}
          {msg.starred ? <small>★</small> : null}
        </div>
        {msg.reaction ? <div className="msgx-msg-reaction">{msg.reaction}</div> : null}
        <button
          type="button"
          className={`msgx-reaction-btn${msg.liked ? ' is-on' : ''}`}
          onClick={() => onToggleLike(msg.id)}
          aria-label={msg.liked ? 'Unlike message' : 'Like message'}
          title={msg.liked ? 'Unlike' : 'Like'}
        >
          👍 {msg.likes || 0}
        </button>
      </div>
    </div>
  );
};

export default ChatMessageBubble;
