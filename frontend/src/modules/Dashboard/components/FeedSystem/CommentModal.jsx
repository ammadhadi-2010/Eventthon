import React from 'react';
import { createPortal } from 'react-dom';
import PostComments from './PostComments';
import './comment-modal.css';

const CommentModal = ({
  isOpen,
  onClose,
  postId,
  userData,
  comments,
  onCommentsChange,
  entityType = 'post',
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="cm-overlay" onClick={onClose} role="presentation">
      <div
        className="cm-shell"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cm-dialog-title"
      >
        <header className="cm-header">
          <h2 id="cm-dialog-title" className="cm-header__title">
            Comments
          </h2>
          <button type="button" className="cm-header__close" onClick={onClose} aria-label="Close comments">
            ×
          </button>
        </header>

        <PostComments
          postId={postId}
          userData={userData}
          comments={comments}
          onCommentsChange={onCommentsChange}
          entityType={entityType}
          layout="modal"
        />
      </div>
    </div>,
    document.body,
  );
};

export default CommentModal;
