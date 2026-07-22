import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function ArticleViewTopActions({ articleId, canManage, onDelete }) {
  const navigate = useNavigate();
  if (!canManage) return null;

  return (
    <div className="article-view__top-actions">
      <button
        type="button"
        className="article-view__btn article-view__btn--edit"
        onClick={() => navigate(`/article/edit/${articleId}`)}
      >
        <FiEdit2 aria-hidden /> Edit
      </button>
      <button
        type="button"
        className="article-view__btn article-view__btn--delete"
        onClick={onDelete}
      >
        <FiTrash2 aria-hidden /> Delete
      </button>
    </div>
  );
}
