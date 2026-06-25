import React from 'react';
import { FiCornerDownRight, FiMoreHorizontal, FiThumbsUp } from 'react-icons/fi';
import ReplyComposer from '../Global/ReplyComposer';
import CommentAvatar from './CommentAvatar';
import { BusinessIcon } from '../../../../components/lottie';
import { API_BASE_URL } from '../../../../api/axiosConfig';

/**
 * Single comment row with profile avatar, bubble, stickers, and replies.
 */
export default function IndividualCommentCard({
  comment,
  userData,
  openMenuId,
  replyingToId,
  replyText,
  setReplyText,
  onLike,
  onReplyStart,
  onReplySubmit,
  onMenuToggle,
  onMenuAction,
  buildReplyKey,
}) {
  const resolvedImageUrl = comment.image_url
    ? String(comment.image_url).startsWith('http')
      ? comment.image_url
      : `${API_BASE_URL}${comment.image_url}`
    : null;

  return (
    <article className="cm-comment-card">
      <div className="cm-comment-card__row">
        <CommentAvatar person={comment} currentUser={userData} size={40} />
        <div className="cm-comment-card__bubble">
          <div className="cm-comment-card__head">
            <div>
              <span className="cm-comment-card__name">{comment.author_name}</span>
              {comment.author_title ? (
                <span className="cm-comment-card__title">{comment.author_title}</span>
              ) : null}
            </div>
            <div className="cm-comment-card__menu-wrap">
              <button
                type="button"
                className="cm-comment-card__menu-btn"
                onClick={() => onMenuToggle(comment.id)}
                aria-label="Comment options"
              >
                <FiMoreHorizontal size={16} />
              </button>
              {openMenuId === comment.id ? (
                <div className="cm-comment-card__menu">
                  <button type="button" onClick={() => onMenuAction('copy', comment.id)}>
                    Copy text
                  </button>
                  <button type="button" onClick={() => onMenuAction('delete', comment.id)}>
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          {comment.text ? <p className="cm-comment-card__text">{comment.text}</p> : null}
          {Array.isArray(comment.working_stickers) && comment.working_stickers.length > 0 ? (
            <div className="cm-comment-stickers">
              {comment.working_stickers.map((sticker) => (
                <BusinessIcon
                  key={`${comment.id}-${sticker.id}-${sticker.label}`}
                  src={sticker.src}
                  size={52}
                  label={sticker.label || 'Working sticker'}
                  loop
                />
              ))}
            </div>
          ) : null}
          {resolvedImageUrl ? (
            <img src={resolvedImageUrl} alt="Comment attachment" className="cm-comment-card__attach" />
          ) : null}
        </div>
      </div>

      <div className="cm-comment-card__actions">
        <button
          type="button"
          className={`cm-comment-card__action${comment.likedByMe ? ' is-liked' : ''}`}
          onClick={() => onLike(comment.id)}
        >
          <FiThumbsUp size={12} /> Like {comment.likes_count > 0 ? comment.likes_count : ''}
        </button>
        <span className="cm-comment-card__divider">|</span>
        <button
          type="button"
          className="cm-comment-card__action"
          onClick={() => onReplyStart(comment.id, comment.author_name, null)}
        >
          <FiCornerDownRight size={12} /> Reply
        </button>
      </div>

      {Array.isArray(comment.replies) && comment.replies.length > 0 ? (
        <ul className="cm-comment-card__replies">
          {comment.replies.map((reply) => (
            <li key={reply.id} className="cm-comment-card__reply">
              <CommentAvatar person={reply} currentUser={userData} size={28} />
              <div className="cm-comment-card__reply-body">
                <div className="cm-comment-card__reply-meta">
                  <span className="cm-comment-card__reply-name">{reply.author_name}</span>
                  <button
                    type="button"
                    onClick={() => onReplyStart(comment.id, reply.author_name, reply.id)}
                  >
                    Reply
                  </button>
                </div>
                <p>{reply.text}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {replyingToId === buildReplyKey(comment.id, 'root') ? (
        <div className="cm-comment-card__reply-compose">
          <ReplyComposer
            variant="dark"
            value={replyText}
            onChange={setReplyText}
            onSubmit={() => onReplySubmit(comment.id)}
            placeholder={`Reply to ${comment.author_name}...`}
            avatarSlot={
              <CommentAvatar
                person={{
                  ...userData,
                  userId: userData?._id,
                  author_name: `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim() || userData?.first_name,
                }}
                currentUser={userData}
                size={30}
              />
            }
            avatarText={userData?.first_name?.charAt(0)?.toUpperCase() || 'Y'}
            onEmojiClick={(emoji) => setReplyText((prev) => `${prev}${emoji}`)}
          />
        </div>
      ) : null}
    </article>
  );
}
