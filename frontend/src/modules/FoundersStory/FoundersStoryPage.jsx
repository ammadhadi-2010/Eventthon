import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import FoundersStoryBody from './FoundersStoryBody';
import FoundersStoryEngagement from './FoundersStoryEngagement';
import useFoundersStory from './useFoundersStory';
import FooterBreadcrumb from '../FooterPages/components/FooterBreadcrumb';
import './styles/founders-story.css';
import './styles/founders-story-mobile.css';

const FS_CRUMBS = [
  { label: 'Footer', to: '#site-footer' },
  { label: 'Company', to: '/company/about' },
  { label: "Founder's Story" },
];

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
      <Link to="/" className="fs-back">
        <FiArrowLeft size={16} aria-hidden />
        Back to Home
      </Link>

      <FooterBreadcrumb items={FS_CRUMBS} />

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
