import React, { useState } from 'react';
import { FiHeart, FiMessageCircle, FiSend, FiShare2 } from 'react-icons/fi';
import useCopyPublicLink from '../Public/hooks/useCopyPublicLink';
import { resolveCommentAuthorName } from './foundersStoryVisitor';

function formatWhen(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function FoundersStoryEngagement({
  userData,
  likesCount,
  liked,
  likeBusy,
  comments,
  commentBusy,
  onLike,
  onComment,
}) {
  const { copied, copyLink } = useCopyPublicLink();
  const [text, setText] = useState('');
  const [guestName, setGuestName] = useState('');
  const loggedName = resolveCommentAuthorName(userData);

  const submitComment = async (event) => {
    event.preventDefault();
    const ok = await onComment(text, loggedName || guestName);
    if (ok) setText('');
  };

  return (
    <section className="fs-engage" aria-label="Story engagement">
      <div className="fs-engage__bar">
        <button
          type="button"
          className={`fs-engage__btn ${liked ? 'is-liked' : ''}`}
          onClick={onLike}
          disabled={likeBusy}
          aria-pressed={liked}
        >
          <FiHeart aria-hidden />
          <span>{liked ? 'Liked' : 'Like'}</span>
          <strong>{likesCount}</strong>
        </button>
        <button
          type="button"
          className="fs-engage__btn"
          onClick={() => copyLink('/founders-story')}
        >
          <FiShare2 aria-hidden />
          <span>{copied ? 'Link copied' : 'Share'}</span>
        </button>
        <div className="fs-engage__meta">
          <FiMessageCircle aria-hidden />
          <span>{comments.length} comment{comments.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      <form className="fs-comment-form" onSubmit={submitComment}>
        {!loggedName ? (
          <input
            className="fs-comment-form__name"
            type="text"
            placeholder="Your name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            maxLength={120}
            required
          />
        ) : null}
        <div className="fs-comment-form__row">
          <textarea
            className="fs-comment-form__input"
            rows={3}
            placeholder="Share your thoughts on the founder's story…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            required
          />
          <button type="submit" className="fs-comment-form__submit" disabled={commentBusy}>
            <FiSend aria-hidden />
            <span>{commentBusy ? 'Posting…' : 'Post'}</span>
          </button>
        </div>
      </form>

      <ul className="fs-comment-list">
        {comments.length === 0 ? (
          <li className="fs-comment-list__empty">Be the first to leave a comment.</li>
        ) : (
          comments.map((row) => (
            <li key={row.id} className="fs-comment-card">
              <div className="fs-comment-card__head">
                <strong>{row.author_name}</strong>
                <time dateTime={row.created_at}>{formatWhen(row.created_at)}</time>
              </div>
              <p>{row.text}</p>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
