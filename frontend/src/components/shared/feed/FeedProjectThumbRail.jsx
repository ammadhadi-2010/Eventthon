import React from 'react';
import { Bot, LayoutTemplate } from 'lucide-react';

function ContributorDots({ urls = [] }) {
  const list = urls.slice(0, 4);
  if (!list.length) return null;
  return (
    <div className="esh-feed-thumb-contributors" aria-hidden="true">
      {list.map((u, i) => (
        <img key={i} src={u} alt="" className="esh-feed-thumb-contributor" />
      ))}
    </div>
  );
}

/**
 * Right-rail project preview (~120px): image or compact placeholder; optional contributor avatars below.
 */
export default function FeedProjectThumbRail({
  imageUrl = '',
  contributorUrls = [],
  /** Small “liked project” style tile with icon + badge (no huge panel). */
  likedMini = false,
  badgeLabel = '',
}) {
  if (likedMini) {
    return (
      <div className="esh-feed-thumb-rail">
        <div className="esh-feed-thumb esh-feed-thumb--liked-mini" aria-hidden="true">
          <Bot size={20} strokeWidth={1.75} className="esh-feed-thumb-liked-ico" />
          {badgeLabel ? <span className="esh-feed-thumb-liked-label">{badgeLabel}</span> : null}
        </div>
        <ContributorDots urls={contributorUrls} />
      </div>
    );
  }

  const hasImg = Boolean(imageUrl);
  return (
    <div className="esh-feed-thumb-rail">
      <div className={`esh-feed-thumb${hasImg ? '' : ' esh-feed-thumb--placeholder'}`}>
        {hasImg ? <img src={imageUrl} alt="" /> : <LayoutTemplate size={20} strokeWidth={1.65} className="esh-feed-thumb-ph-ico" />}
      </div>
      <ContributorDots urls={contributorUrls} />
    </div>
  );
}
