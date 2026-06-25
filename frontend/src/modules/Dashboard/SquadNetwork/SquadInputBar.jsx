import React, { useEffect, useRef, useState } from 'react';
import { FiImage, FiPaperclip, FiSend, FiSmile, FiX } from 'react-icons/fi';
import EmojiPicker from '../components/Global/EmojiPicker';

const SquadInputBar = ({
  message,
  setMessage,
  squadName,
  onSend,
  onFileSelect,
  editingMessage,
  onCancelEdit,
}) => {
  const fileRef = useRef(null);
  const imageRef = useRef(null);
  const toolsRef = useRef(null);
  const [composerEmojiOpen, setComposerEmojiOpen] = useState(false);
  const [emojiAnchor, setEmojiAnchor] = useState({ x: 0, y: 0 });
  const canSend = Boolean(message?.trim());

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend?.();
    }
  };

  const openComposerEmoji = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setEmojiAnchor({ x: Math.max(10, rect.left - 280), y: rect.top - 380 });
    setComposerEmojiOpen((prev) => !prev);
  };

  const insertEmoji = (emoji) => {
    setMessage(`${message || ''}${emoji}`);
    setComposerEmojiOpen(false);
  };

  useEffect(() => {
    if (!composerEmojiOpen) return undefined;
    const onPointerDown = (event) => {
      if (toolsRef.current?.contains(event.target)) return;
      if (event.target.closest('.msgx-compose-emoji-float')) return;
      setComposerEmojiOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [composerEmojiOpen]);

  return (
    <div className="squad-chat-composer">
      {editingMessage ? (
        <div className="squad-chat-composer__edit-banner">
          <span>Editing message</span>
          <button type="button" onClick={onCancelEdit} aria-label="Cancel edit">
            <FiX size={16} />
          </button>
        </div>
      ) : null}
      <div className="squad-chat-composer__row">
        <div className="squad-chat-composer__tools" ref={toolsRef}>
          <button type="button" aria-label="Add emoji" onClick={openComposerEmoji}>
            <FiSmile size={20} />
          </button>
          <button type="button" aria-label="Attach image" onClick={() => imageRef.current?.click()}>
            <FiImage size={20} />
          </button>
          <button type="button" aria-label="Attach file" onClick={() => fileRef.current?.click()}>
            <FiPaperclip size={20} />
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect?.(file);
            e.target.value = '';
          }}
        />
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect?.(file);
            e.target.value = '';
          }}
        />
        <textarea
          className="squad-chat-composer__input"
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={editingMessage ? 'Edit your message...' : `Message ${squadName || 'squad'}...`}
          aria-label="Type a message"
        />
        <button
          type="button"
          className="squad-chat-composer__send"
          onClick={onSend}
          disabled={!canSend}
          aria-label={editingMessage ? 'Save message' : 'Send message'}
        >
          <FiSend size={18} />
        </button>
      </div>
      {composerEmojiOpen ? (
        <div
          className="msgx-compose-emoji-float"
          style={{ left: `${emojiAnchor.x}px`, top: `${emojiAnchor.y}px` }}
        >
          <EmojiPicker width={300} height={360} onSelect={insertEmoji} />
        </div>
      ) : null}
    </div>
  );
};

export default SquadInputBar;
