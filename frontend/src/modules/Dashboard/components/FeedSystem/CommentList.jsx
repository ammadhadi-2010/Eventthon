import React from 'react';
import IndividualCommentCard from './IndividualCommentCard';

export default function CommentList({
  comments,
  userData,
  openMenuId,
  setOpenMenuId,
  replyingToId,
  replyText,
  setReplyText,
  onLike,
  onReplyStart,
  onReplySubmit,
  onMenuAction,
  buildReplyKey,
}) {
  if (!comments.length) {
    return (
      <div className="cm-list-empty">
        <p>No comments yet. Start the conversation.</p>
      </div>
    );
  }

  return (
    <ul className="cm-list">
      {comments.map((comment) => (
        <li key={comment.id} className="cm-list-item">
          <IndividualCommentCard
            comment={comment}
            userData={userData}
            openMenuId={openMenuId}
            replyingToId={replyingToId}
            replyText={replyText}
            setReplyText={setReplyText}
            onLike={onLike}
            onReplyStart={onReplyStart}
            onReplySubmit={onReplySubmit}
            onMenuToggle={(id) => setOpenMenuId(openMenuId === id ? null : id)}
            onMenuAction={onMenuAction}
            buildReplyKey={buildReplyKey}
          />
        </li>
      ))}
    </ul>
  );
}
