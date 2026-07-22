import React, { useEffect, useRef, useState } from 'react';
import { FiBookmark, FiMoreHorizontal } from 'react-icons/fi';
import { resolveDashboardMediaUrl } from '../../utils/dashboardMedia';
import PostMetricsBar from './PostMetricsBar';
import { formatTimeAgo, statusLabel } from './profilePostsUtils';

export default function PostCardItem({ item, onAction }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);
  const menuRef = useRef(null);
  const imageSrc = resolveDashboardMediaUrl(item.imageurl);
  const showImage = Boolean(imageSrc) && !imageBroken;
  const statusClass = `pposts-card__status pposts-card__status--${item.status || 'published'}`;

  useEffect(() => {
    setImageBroken(false);
  }, [imageSrc]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const handleMenuAction = (actionKey) => {
    setMenuOpen(false);
    onAction?.(actionKey, item);
  };

  return (
    <article className={`pposts-card${item.pinned ? ' is-pinned' : ''}`}>
      <div className="pposts-card__body">
        <div className="pposts-card__thumb-wrap">
          {showImage ? (
            <img
              src={imageSrc}
              alt=""
              className="pposts-card__thumb"
              loading="lazy"
              onError={() => setImageBroken(true)}
            />
          ) : (
            <div className="pposts-card__thumb-fallback" aria-hidden>
              {(item.title || 'P').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="pposts-card__content">
          <div className="pposts-card__head">
            <div className="pposts-card__head-main">
              <h3 className="pposts-card__title">{item.title}</h3>
              <div className="pposts-card__meta">
                <span className={statusClass}>{statusLabel(item.status)}</span>
                <time className="pposts-card__time" dateTime={item.createdAt || undefined}>
                  {formatTimeAgo(item.createdAt)}
                </time>
              </div>
            </div>

            <div className="pposts-card__tools">
              {item.pinned ? (
                <span className="pposts-card__pin" title="Pinned post" aria-label="Pinned post">
                  <FiBookmark aria-hidden />
                </span>
              ) : null}
              <div className="pposts-card__menu-wrap" ref={menuRef}>
                <button
                  type="button"
                  className="pposts-card__menu-btn"
                  aria-label="Post options"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  <FiMoreHorizontal aria-hidden />
                </button>
                {menuOpen ? (
                  <div className="pposts-card__menu" role="menu">
                    <button type="button" role="menuitem" onClick={() => handleMenuAction('view')}>View</button>
                    <button type="button" role="menuitem" onClick={() => handleMenuAction('edit')}>Edit</button>
                    <button type="button" role="menuitem" onClick={() => handleMenuAction('analytics')}>Analytics</button>
                    <button type="button" role="menuitem" className="is-danger" onClick={() => handleMenuAction('delete')}>Delete</button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <p className="pposts-card__excerpt">{item.excerpt || 'No preview available yet.'}</p>
        </div>
      </div>

      <PostMetricsBar
        metrics={item.metrics}
        status={item.status}
        onAction={(key) => onAction?.(key, item)}
      />
    </article>
  );
}
