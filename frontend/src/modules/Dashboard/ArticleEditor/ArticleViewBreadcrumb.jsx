import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { truncateArticleTitle } from './articleContentUtils';

export default function ArticleViewBreadcrumb({
  title = '',
  isPreview = false,
  editPath = '',
}) {
  const currentLabel = isPreview
    ? 'Preview'
    : truncateArticleTitle(title) || 'Article';

  return (
    <nav className="artview-breadcrumb" aria-label="Breadcrumb">
      <Link to="/dashboard" className="artview-breadcrumb__link">
        Home
      </Link>
      <FiChevronRight size={12} className="artview-breadcrumb__sep" aria-hidden />
      <Link to="/article" className="artview-breadcrumb__link">
        Articles
      </Link>
      {isPreview && editPath ? (
        <>
          <FiChevronRight size={12} className="artview-breadcrumb__sep" aria-hidden />
          <Link to={editPath} className="artview-breadcrumb__link">
            Edit
          </Link>
        </>
      ) : null}
      <FiChevronRight size={12} className="artview-breadcrumb__sep" aria-hidden />
      <span className="artview-breadcrumb__current" aria-current="page">
        {currentLabel}
      </span>
    </nav>
  );
}
