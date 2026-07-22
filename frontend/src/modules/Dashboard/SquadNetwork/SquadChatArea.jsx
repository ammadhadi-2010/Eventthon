import React, { useEffect, useMemo, useRef } from 'react';
import SquadChatMessage, { formatTime } from './components/chat/SquadChatMessage';

function isImageAttachment(fileName, url) {
  const hint = String(fileName || url || '').toLowerCase();
  return /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(hint);
}

function normalizeMessage(msg, currentUserId, currentUserName) {
  const senderId = msg.sender_id || msg.user_id;
  const name = msg.sender_name || msg.sender || 'Member';
  const fileName = msg.file_name || '';
  const downloadUrl = msg.download_url || '';
  const imageAttachment = msg.type === 'file' && isImageAttachment(fileName, downloadUrl);
  const mediaSrc = msg.image_url || msg.src || (imageAttachment ? downloadUrl : '');
  return {
    id: msg.id || msg._id || `${name}-${msg.created_at || msg.time}`,
    text: msg.text || msg.message || '',
    senderName: name,
    senderId,
    time: formatTime(msg.created_at || msg.time),
    isOwn: Boolean(
      msg.is_own ||
        (currentUserId && senderId && String(senderId) === String(currentUserId)) ||
        (currentUserName && name.trim() === currentUserName.trim()),
    ),
    type: imageAttachment || (msg.type === 'image' && mediaSrc) ? 'image' : (msg.type || 'text'),
    reactions: msg.reactions,
    file_name: fileName,
    download_url: downloadUrl,
    src: mediaSrc,
    edited: Boolean(msg.edited),
  };
}

export default function SquadChatArea({ messages, currentUserId, currentUserName, onOpenMessageMenu }) {
  const endRef = useRef(null);
  const list = Array.isArray(messages) ? messages : [];

  const normalized = useMemo(
    () => list.map((m) => normalizeMessage(m, currentUserId, currentUserName)),
    [list, currentUserId, currentUserName],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: normalized.length > 40 ? 'auto' : 'smooth',
      block: 'end',
    });
  }, [normalized.length]);

  const handleOpenMenu = (event, msg) => {
    onOpenMessageMenu?.(event, msg.id, msg.isOwn);
  };

  if (!normalized.length) {
    return (
      <div className="squad-chat-messages">
        <div className="squad-chat-empty">
          <strong>No messages yet</strong>
          <span>Say hello to your squad — your message will appear here.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="squad-chat-messages">
      <div className="squad-chat-day">Today</div>
      {normalized.map((msg, index) => {
        const next = normalized[index + 1];
        const prev = normalized[index - 1];
        const groupKey = (m) => m.senderId || m.senderName;
        const isGroupedWithNext =
          next && next.isOwn === msg.isOwn && groupKey(next) === groupKey(msg);
        const showAvatar =
          !msg.isOwn && (!prev || prev.isOwn || groupKey(prev) !== groupKey(msg));
        const showName = !msg.isOwn && showAvatar;

        return (
          <SquadChatMessage
            key={msg.id}
            message={msg}
            isOwn={msg.isOwn}
            showAvatar={showAvatar}
            showName={showName}
            isGroupedWithNext={isGroupedWithNext}
            onOpenMenu={handleOpenMenu}
          />
        );
      })}
      <div ref={endRef} aria-hidden />
    </div>
  );
}
