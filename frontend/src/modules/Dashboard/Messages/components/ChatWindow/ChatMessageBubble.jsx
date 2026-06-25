import React, { useState } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
import { formatClock } from '../../utils/messagesFormat';

const PLACEHOLDER_TEXT = new Set(['', 'attachment']);

function shouldShowText(text, hasAttachments) {
  const normalized = String(text || '').trim().toLowerCase();
  if (!normalized) return false;
  if (hasAttachments && PLACEHOLDER_TEXT.has(normalized)) return false;
  return true;
}

const ChatMessageBubble = ({
  msg,
  toAbsoluteUrl,
  onOpenMessageMenu,
  onToggleLike,
}) => {
  const [brokenImages, setBrokenImages] = useState({});
  const attachments = Array.isArray(msg.attachments) ? msg.attachments : [];
  const hasAttachments = attachments.length > 0;
  const isMediaOnly = hasAttachments && !shouldShowText(msg.text, hasAttachments);

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

        {shouldShowText(msg.text, hasAttachments) ? <p className="msgx-bubble-text">{msg.text}</p> : null}

        {hasAttachments ? (
          <div className="msgx-attachments">
            {attachments.map((item, idx) => {
              const itemUrl = toAbsoluteUrl(item?.imageurl || item?.url);
              const itemName = item?.name || `attachment-${idx + 1}`;
              const itemType = String(item?.type || '').toLowerCase();
              const isImage =
                itemType.includes('image') ||
                /\.(png|jpe?g|gif|webp|bmp)(\?|$)/i.test(itemUrl);

              if (isImage && itemUrl && !brokenImages[idx]) {
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
              if (itemType.includes('audio') && itemUrl) {
                return (
                  <div key={`${msg.id}-att-${idx}`} className="msgx-attach-audio">
                    <audio controls src={itemUrl} />
                  </div>
                );
              }
              return (
                <a
                  key={`${msg.id}-att-${idx}`}
                  className="msgx-attach-file"
                  href={itemUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                >
                  {itemName}
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
          <small className={`msgx-ticks is-${msg.delivery || 'sent'}`}>
            {msg.delivery === 'failed' ? '!' : msg.delivery === 'sent' ? '✓' : '✓✓'}
          </small>
          {msg.starred ? <small>★</small> : null}
        </div>
        {msg.reaction ? <div className="msgx-msg-reaction">{msg.reaction}</div> : null}
        {msg.sender === 'seller' ? (
          <button
            type="button"
            className={`msgx-reaction-btn${msg.liked ? ' is-on' : ''}`}
            onClick={() => onToggleLike(msg.id)}
          >
            👍 {msg.likes || 0}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ChatMessageBubble;
