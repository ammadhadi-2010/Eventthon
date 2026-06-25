import React from 'react';

/** Compact overlapping avatars for the right rail on “followed” activities. */
export default function FeedFollowRail({ urls = [] }) {
  const [a, b, c] = urls;
  if (!a) return null;
  return (
    <div className="esh-feed-follow-rail" aria-hidden="true">
      <div className="esh-feed-follow-rail-inner">
        {a ? <img src={a} alt="" className="esh-feed-follow-rail-av" /> : null}
        {b ? <span className="esh-feed-follow-rail-plus">+</span> : null}
        {b ? <img src={b} alt="" className="esh-feed-follow-rail-av" /> : null}
        {c ? <img src={c} alt="" className="esh-feed-follow-rail-av" /> : null}
      </div>
    </div>
  );
}
