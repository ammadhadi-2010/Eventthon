import React from 'react';
import { FiImage, FiSend, FiSmile, FiZap } from 'react-icons/fi';
import CommentDualPicker from './CommentDualPicker';
import CommentAvatar from './CommentAvatar';
import { BusinessIcon } from '../../../../components/lottie';

export default function CommentInput({
  userData,
  commentText,
  setCommentText,
  isSubmitting,
  pickerOpen,
  setPickerOpen,
  pickerTab,
  openPicker,
  pendingStickers,
  removePendingSticker,
  addWorkingSticker,
  selectedImageName,
  selectedImagePreview,
  fileInputRef,
  handleImageSelect,
  handleSubmit,
}) {
  const canSend = Boolean(commentText.trim() || selectedImageName || pendingStickers.length);

  return (
    <footer className="cm-input-bar">
      <div className="cm-input-row">
        <CommentAvatar
          person={{
            ...userData,
            userId: userData?._id,
            author_name: `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim() || userData?.first_name,
          }}
          currentUser={userData}
          size={40}
        />
        <div className="cm-input-compose">
        <div className="cm-input-box">
          <input
            type="text"
            className="cm-input-field"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
            aria-label="Comment text"
          />
          <div className="cm-input-actions">
            <button
              type="button"
              className="cm-icon-btn"
              title="Emojis"
              aria-label="Open emoji picker"
              onClick={() => openPicker('emoji')}
            >
              <FiSmile size={18} />
            </button>
            <button
              type="button"
              className="cm-icon-btn cm-icon-btn--working"
              title="Working stickers"
              aria-label="Open working sticker gallery"
              onClick={() => openPicker('working')}
            >
              <FiZap size={18} />
            </button>
            <button
              type="button"
              className="cm-icon-btn"
              title="Attach image"
              aria-label="Attach image"
              onClick={() => fileInputRef.current?.click()}
            >
              <FiImage size={18} />
            </button>
            <button
              type="button"
              className="cm-send-btn"
              disabled={!canSend || isSubmitting}
              onClick={handleSubmit}
              aria-label="Post comment"
            >
              <FiSend size={16} />
            </button>
          </div>
        </div>
        </div>
      </div>

      {pendingStickers.length > 0 ? (
        <div className="cm-pending-stickers">
          {pendingStickers.map((s) => (
            <span key={s.uid} className="cm-pending-sticker">
              <BusinessIcon src={s.src} size={36} label={s.label} loop />
              <button type="button" onClick={() => removePendingSticker(s.uid)} aria-label={`Remove ${s.label}`}>
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {selectedImageName ? (
        <p className="cm-input-helper">Image selected: {selectedImageName}</p>
      ) : null}
      {selectedImagePreview ? (
        <img src={selectedImagePreview} alt="Selected upload preview" className="cm-input-preview" />
      ) : null}

      {pickerOpen ? (
        <div className="cm-input-picker-slot">
          <CommentDualPicker
            isOpen={pickerOpen}
            initialTab={pickerTab}
            onClose={() => setPickerOpen(false)}
            onSelectEmoji={(emoji) => setCommentText((prev) => `${prev}${emoji}`)}
            onSelectWorking={addWorkingSticker}
          />
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="cm-file-input"
        onChange={handleImageSelect}
      />
    </footer>
  );
}
