import React, { useLayoutEffect, useRef, useState } from 'react';
import { truncateFeedText } from './feedAuthor';
import './post-expandable-text.css';

const SEE_MORE = 'See more';
const DEFAULT_MAX_LINES = 3;
const DEFAULT_ARTICLE_MAX_CHARS = 340;

export default function PostExpandableText({
  text = '',
  fullText = '',
  lineClamp = DEFAULT_MAX_LINES,
  maxChars = 0,
  expandOnce = false,
  onSeeMore,
  seeMoreLabel = SEE_MORE,
}) {
  const [expanded, setExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);
  const textRef = useRef(null);
  const cleaned = String(text || '').trim();
  const expandedBody = String(fullText || text || '').trim() || cleaned;
  const maxLines = lineClamp === 1 ? 1 : DEFAULT_MAX_LINES;
  const clampClass =
    maxLines === 1 ? 'feed-post-text__body--clamp-1' : 'feed-post-text__body--clamp-3';
  const charLimit = maxChars > 0 ? maxChars : DEFAULT_ARTICLE_MAX_CHARS;
  const charPreview = truncateFeedText(cleaned, charLimit);
  const useCharPreview = expandOnce && charPreview.truncated;

  useLayoutEffect(() => {
    if (expandOnce) return;
    setExpanded(false);
    setNeedsToggle(false);
  }, [cleaned, expandOnce]);

  useLayoutEffect(() => {
    if (expanded || !cleaned || useCharPreview) return undefined;

    const el = textRef.current;
    if (!el) return undefined;

    const measure = () => {
      setNeedsToggle(el.scrollHeight > el.clientHeight + 1);
    };

    measure();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    resizeObserver?.observe(el);
    window.addEventListener('resize', measure);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [cleaned, expanded, clampClass, useCharPreview]);

  if (!cleaned) return null;

  const handleSeeMore = () => {
    if (typeof onSeeMore === 'function') {
      onSeeMore();
      return;
    }
    setExpanded(true);
  };

  if (expanded || (expandOnce && !charPreview.truncated && !onSeeMore)) {
    return (
      <div className="feed-post-text">
        <p className="feed-post-text__body">{expandedBody}</p>
      </div>
    );
  }

  if (useCharPreview) {
    return (
      <div className="feed-post-text">
        <p className="feed-post-text__body">
          {charPreview.preview}
          {' '}
          <button
            type="button"
            className="feed-post-text__toggle feed-post-text__toggle--inline"
            onClick={handleSeeMore}
            aria-expanded={false}
          >
            {seeMoreLabel}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="feed-post-text">
      <p ref={textRef} className={`feed-post-text__body ${clampClass}`}>
        {cleaned}
      </p>
      {needsToggle ? (
        <button
          type="button"
          className="feed-post-text__toggle feed-post-text__toggle--block"
          onClick={handleSeeMore}
          aria-expanded={false}
        >
          {seeMoreLabel}
        </button>
      ) : null}
    </div>
  );
}
