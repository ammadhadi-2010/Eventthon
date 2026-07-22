import React, { useState } from 'react';
import { FiArrowRight, FiClock, FiEdit2, FiEye, FiTrash2 } from 'react-icons/fi';
import { resolveDashboardMediaUrl } from '../utils/dashboardMedia';
import { normalizeArticleTitle } from './articleLibraryUtils';

export default function ArticleLibraryCard({ article, onOpen, onEdit, onDelete }) {
  const [imageBroken, setImageBroken] = useState(false);
  const coverSrc = resolveDashboardMediaUrl(article.imageurl || article.cover_image);
  const showCover = Boolean(coverSrc) && !imageBroken;
  const displayTitle = normalizeArticleTitle(article.title);
  const status = String(article.status || 'draft').toLowerCase();

  return (
    <article className="artlib-card">
      <button type="button" className="artlib-card__open" onClick={() => onOpen?.(article._id)}>
        <div className="artlib-card__thumb">
          {showCover ? (
            <img
              src={coverSrc}
              alt=""
              className="artlib-card__thumb-img"
              loading="lazy"
              onError={() => setImageBroken(true)}
            />
          ) : (
            <div className="artlib-card__thumb-fallback" aria-hidden>
              {displayTitle.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="artlib-card__body">
          <div className="artlib-card__meta-top">
            <span className="artlib-card__pill">{article.category || 'General'}</span>
            <span className={`artlib-card__status artlib-card__status--${status}`}>{status}</span>
          </div>
          <h3 className="artlib-card__title">{displayTitle}</h3>
          <p className="artlib-card__excerpt">{article.excerpt || 'No excerpt available.'}</p>
          <div className="artlib-card__meta-bottom">
            <span><FiClock aria-hidden /> {article.reading_time || 1} min</span>
            <span><FiEye aria-hidden /> {article.metadata?.views || 0}</span>
          </div>
          <span className="artlib-card__cta">
            Open Article <FiArrowRight aria-hidden />
          </span>
        </div>
      </button>
      <div className="artlib-card__actions">
        <button type="button" className="artlib-card__btn artlib-card__btn--edit" onClick={() => onEdit?.(article._id)}>
          <FiEdit2 aria-hidden /> Edit
        </button>
        <button
          type="button"
          className="artlib-card__btn artlib-card__btn--delete"
          onClick={() => onDelete?.(article._id, article.title)}
        >
          <FiTrash2 aria-hidden /> Delete
        </button>
      </div>
    </article>
  );
}
