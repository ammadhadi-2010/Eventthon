import React, { useLayoutEffect, useRef, useState } from 'react';
import './post-expandable-text.css';

const SEE_MORE = 'See more';
const SEE_LESS = 'See less';
const DEFAULT_MAX_LINES = 3;

export default function PostExpandableText({ text = '', lineClamp = DEFAULT_MAX_LINES }) {
  const [expanded, setExpanded] = useState(false);
  const [needsToggle, setNeedsToggle] = useState(false);
  const textRef = useRef(null);
  const cleaned = String(text || '').trim();
  const maxLines = lineClamp === 1 ? 1 : DEFAULT_MAX_LINES;
  const clampClass =
    maxLines === 1 ? 'feed-post-text__body--clamp-1' : 'feed-post-text__body--clamp-3';

  useLayoutEffect(() => {
    setExpanded(false);
    setNeedsToggle(false);
  }, [cleaned]);

  useLayoutEffect(() => {
    if (expanded || !cleaned) return undefined;

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
  }, [cleaned, expanded, clampClass]);

  if (!cleaned) return null;

  if (expanded) {
    return (
      <div className="feed-post-text">
        <p className="feed-post-text__body">{cleaned}</p>
        {needsToggle ? (
          <button
            type="button"
            className="feed-post-text__toggle feed-post-text__toggle--block"
            onClick={() => setExpanded(false)}
          >
            {SEE_LESS}
          </button>
        ) : null}
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
          onClick={() => setExpanded(true)}
          aria-expanded={false}
        >
          {SEE_MORE}
        </button>
      ) : null}
    </div>
  );
}
