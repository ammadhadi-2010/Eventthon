import React from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
import { squadsAbsoluteUrl } from '../../utils/squadsMediaUrl';
import './squad-chat-messenger.css';

function formatTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function Avatar({ name, image }) {
  const initial = (name || 'M').charAt(0).toUpperCase();
  if (image) {
    return <img src={image} alt="" className="squad-msg__avatar-img" />;
  }
  return <span className="squad-msg__avatar-fallback">{initial}</span>;
}

function SquadChatMessage({
  message,
  isOwn,
  showAvatar,
  showName,
  isGroupedWithNext,
  onOpenMenu,
}) {
  const {
    text,
    senderName,
    time,
    type,
    reactions,
    file_name,
    download_url,
    src,
    edited,
  } = message;

  const bubbleActions = (content) => (
    <div className={`squad-msg__bubble ${isOwn ? 'is-own' : 'is-other'}`}>
      <button
        type="button"
        className="squad-msg__more msgx-bubble-more"
        onClick={(event) => onOpenMenu?.(event, message)}
        aria-label="Message options"
      >
        <FiMoreHorizontal size={13} />
      </button>
      {content}
      {edited ? <span className="squad-msg__edited">Edited</span> : null}
    </div>
  );

  if (type === 'image' && src) {
    return (
      <div className={`squad-msg-row ${isOwn ? 'is-own' : 'is-other'} ${isGroupedWithNext ? 'is-grouped' : ''}`}>
        {!isOwn && showAvatar ? (
          <div className="squad-msg__avatar-slot">
            <Avatar name={senderName} />
          </div>
        ) : !isOwn ? <div className="squad-msg__avatar-spacer" /> : null}
        <div className="squad-msg__stack">
          {!isOwn && showName ? <span className="squad-msg__name">{senderName}</span> : null}
          <div className="squad-msg__media">
            <button
              type="button"
              className="squad-msg__more squad-msg__more--media msgx-bubble-more"
              onClick={(event) => onOpenMenu?.(event, message)}
              aria-label="Message options"
            >
              <FiMoreHorizontal size={13} />
            </button>
            <img src={src} alt="Shared" />
          </div>
          {time ? <span className="squad-msg__time">{time}</span> : null}
        </div>
      </div>
    );
  }

  if (type === 'file') {
    return (
      <div className={`squad-msg-row ${isOwn ? 'is-own' : 'is-other'}`}>
        {!isOwn && showAvatar ? (
          <div className="squad-msg__avatar-slot">
            <Avatar name={senderName} />
          </div>
        ) : !isOwn ? <div className="squad-msg__avatar-spacer" /> : null}
        <div className="squad-msg__stack">
          {bubbleActions(
            <>
              <p className="squad-msg__file-title">{file_name || 'Attachment'}</p>
              <a
                className="squad-msg__file-link"
                href={squadsAbsoluteUrl(download_url)}
                target="_blank"
                rel="noreferrer"
              >
                Download
              </a>
            </>,
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`squad-msg-row ${isOwn ? 'is-own' : 'is-other'} ${isGroupedWithNext ? 'is-grouped' : ''}`}>
      {!isOwn && showAvatar ? (
        <div className="squad-msg__avatar-slot">
          <Avatar name={senderName} />
        </div>
      ) : !isOwn ? <div className="squad-msg__avatar-spacer" /> : null}
      <div className="squad-msg__stack">
        {!isOwn && showName ? <span className="squad-msg__name">{senderName}</span> : null}
        {bubbleActions(<p className="squad-msg__text">{text}</p>)}
        {reactions?.length ? (
          <div className="squad-msg__reactions">
            {reactions.map((r) => (
              <span key={r.emoji} className="squad-msg__reaction">
                {r.emoji} {r.count}
              </span>
            ))}
          </div>
        ) : null}
        {!isGroupedWithNext && time ? <span className="squad-msg__time">{time}</span> : null}
      </div>
    </div>
  );
}

export default React.memo(SquadChatMessage);
export { formatTime };
