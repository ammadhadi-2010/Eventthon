import React, { useRef } from 'react';
import { FiImage, FiPaperclip, FiSend } from 'react-icons/fi';

const ChatComposer = ({
  replyTo,
  onCancelReply,
  fileInputRef,
  imageInputRef,
  onPickFile,
  pendingAttachments,
  onRemovePendingAttachment,
  draft,
  onDraftChange,
  onSend,
  sending,
  isDraftConversation,
}) => {
  const textareaRef = useRef(null);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <footer className="msgx-chat-compose msgx-chat-compose--sticky">
      {replyTo ? (
        <div className="msgx-compose-reply">
          <small>
            Replying to {replyTo.sender === 'seller' ? 'Seller' : 'You'}: {replyTo.text}
          </small>
          <button type="button" onClick={onCancelReply} aria-label="Cancel reply">
            ×
          </button>
        </div>
      ) : null}

      {pendingAttachments.length > 0 ? (
        <div className="msgx-compose-attachments">
          {pendingAttachments.map((item, idx) => (
            <div key={`${item?.url || item?.imageurl || item?.name}-${idx}`} className="msgx-compose-attach-chip">
              <span>{item?.name || `attachment-${idx + 1}`}</span>
              <button type="button" onClick={() => onRemovePendingAttachment(idx)} aria-label="Remove attachment">
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="msgx-compose-main-row">
        <input
          ref={fileInputRef}
          className="msgx-hidden-input"
          type="file"
          onChange={(event) => onPickFile(event, 'file')}
        />
        <input
          ref={imageInputRef}
          className="msgx-hidden-input"
          type="file"
          accept="image/*"
          onChange={(event) => onPickFile(event, 'image')}
        />
        <div className="msgx-compose-tool-group">
          <button type="button" className="msgx-compose-tool-btn" onClick={() => fileInputRef.current?.click()} aria-label="Attach file">
            <FiPaperclip size={16} />
          </button>
          <button type="button" className="msgx-compose-tool-btn" onClick={() => imageInputRef.current?.click()} aria-label="Attach image">
            <FiImage size={16} />
          </button>
        </div>
        <textarea
          ref={textareaRef}
          className="msgx-compose-textarea"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          aria-label="Message input"
        />
        <button
          type="button"
          className="msgx-compose-send-btn"
          disabled={(!draft.trim() && pendingAttachments.length === 0) || sending}
          onClick={onSend}
          title={isDraftConversation ? 'Send first message to create conversation' : 'Send message'}
        >
          <FiSend size={15} />
          <span>{sending ? 'Sending…' : 'Send'}</span>
        </button>
      </div>
    </footer>
  );
};

export default ChatComposer;
