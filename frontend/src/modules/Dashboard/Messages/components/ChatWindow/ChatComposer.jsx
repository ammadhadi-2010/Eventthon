import React, { useRef, useState } from 'react';
import {
  FiCode,
  FiImage,
  FiMic,
  FiPaperclip,
  FiSend,
  FiSmile,
} from 'react-icons/fi';
import AttachmentPreviewCards from '../companyCollab/AttachmentPreviewCards';
import GifPicker from '../companyOps/GifPicker';

const COMPANY_ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.png,.jpg,.jpeg,.webp,.gif,.mp4,.webm,.mov,.txt';

const ChatComposer = ({
  replyTo,
  onCancelReply,
  fileInputRef,
  imageInputRef,
  onPickFile,
  onDropFiles,
  pendingAttachments,
  onRemovePendingAttachment,
  draft,
  onDraftChange,
  onSend,
  sending,
  isDraftConversation,
  companyMode = false,
  squadMode = false,
  toAbsoluteUrl,
  onOpenEmoji,
  onInsertCode,
  onToggleRecording,
  isRecording = false,
  recordingSecs = 0,
  onPickGif,
  typingVisible = false,
}) => {
  const textareaRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [gifOpen, setGifOpen] = useState(false);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  const onDragOver = (e) => {
    if (!companyMode) return;
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = (e) => {
    if (!companyMode) return;
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragging(false);
  };

  const onDrop = (e) => {
    if (!companyMode) return;
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length) onDropFiles?.(files);
  };

  return (
    <footer
      className={`msgx-chat-compose msgx-chat-compose--sticky cc-drop${dragging ? ' is-dragging' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {dragging ? <div className="cc-drop__hint">Drop resume, images, video, PDF, Word, Excel, or ZIP</div> : null}
      {gifOpen ? (
        <GifPicker
          onClose={() => setGifOpen(false)}
          onPick={(url, label) => {
            onPickGif?.(url, label);
            setGifOpen(false);
          }}
        />
      ) : null}

      {typingVisible ? <div className="msgx-typing-row">Typing…</div> : null}

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

      {companyMode ? (
        <AttachmentPreviewCards
          items={pendingAttachments}
          onRemove={onRemovePendingAttachment}
          toAbsoluteUrl={toAbsoluteUrl}
        />
      ) : pendingAttachments.length > 0 ? (
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
          multiple={companyMode}
          accept={companyMode ? COMPANY_ACCEPT : undefined}
          onChange={(event) => onPickFile(event, 'file')}
        />
        <input
          ref={imageInputRef}
          className="msgx-hidden-input"
          type="file"
          multiple={companyMode}
          accept="image/*,video/*,.gif"
          onChange={(event) => onPickFile(event, 'image')}
        />
        <div className={`msgx-compose-tool-group${companyMode ? ' msgx-compose-tool-group--rich' : ''}`}>
          <button type="button" className="msgx-compose-tool-btn" onClick={() => fileInputRef.current?.click()} aria-label="Attach file">
            <FiPaperclip size={16} />
          </button>
          <button type="button" className="msgx-compose-tool-btn" onClick={() => imageInputRef.current?.click()} aria-label="Attach image">
            <FiImage size={16} />
          </button>
          {companyMode ? (
            <>
              <button type="button" className="msgx-compose-tool-btn" onClick={onOpenEmoji} aria-label="Emoji picker">
                <FiSmile size={16} />
              </button>
              <button type="button" className="msgx-compose-tool-btn" onClick={() => setGifOpen((v) => !v)} aria-label="GIF picker">
                GIF
              </button>
              <button type="button" className="msgx-compose-tool-btn" onClick={onInsertCode} aria-label="Insert code block">
                <FiCode size={16} />
              </button>
              <button
                type="button"
                className={`msgx-compose-tool-btn${isRecording ? ' is-recording' : ''}`}
                onClick={onToggleRecording}
                aria-label="Voice message"
                title={isRecording ? `Stop (${recordingSecs}s)` : 'Voice message'}
              >
                <FiMic size={16} />
              </button>
            </>
          ) : null}
        </div>
        <textarea
          ref={textareaRef}
          className="msgx-compose-textarea"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            squadMode
              ? 'Message squad member… use @ to mention'
              : companyMode
                ? 'Message candidate… use @ to mention teammates'
                : 'Type a message...'
          }
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
