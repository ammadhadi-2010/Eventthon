import React from 'react';
import FoundersStoryBody from './FoundersStoryBody';
import FoundersStoryEngagement from './FoundersStoryEngagement';
import useFoundersStory from './useFoundersStory';
import './styles/founders-story.css';
import './styles/founders-story-mobile.css';

export default function FoundersStoryPage({ userData }) {
  const {
    content,
    likesCount,
    liked,
    comments,
    loading,
    error,
    likeBusy,
    commentBusy,
    onLike,
    onComment,
  } = useFoundersStory(userData);

  return (
    <div className="fs-page">
      <header className="fs-hero">
        <p className="fs-hero__eyebrow">EventThon</p>
        <h1>Founder&apos;s Story</h1>
        <p className="fs-hero__lead">
          The vision, grit, and purpose behind the network we are building together.
        </p>
      </header>

      <article className="fs-card">
        {loading ? <p className="fs-status">Loading story…</p> : null}
        {!loading && error ? <p className="fs-status fs-status--error">{error}</p> : null}
        {!loading ? <FoundersStoryBody content={content} /> : null}
      </article>

      {!loading ? (
        <FoundersStoryEngagement
          userData={userData}
          likesCount={likesCount}
          liked={liked}
          likeBusy={likeBusy}
          comments={comments}
          commentBusy={commentBusy}
          onLike={onLike}
          onComment={onComment}
        />
      ) : null}
    </div>
  );
}
