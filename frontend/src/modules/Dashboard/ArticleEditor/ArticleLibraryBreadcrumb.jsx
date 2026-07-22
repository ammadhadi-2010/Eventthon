import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

export default function ArticleLibraryBreadcrumb() {
  return (
    <nav className="artlib-breadcrumb" aria-label="Breadcrumb">
      <Link to="/dashboard" className="artlib-breadcrumb__link">
        Home
      </Link>
      <FiChevronRight size={12} className="artlib-breadcrumb__sep" aria-hidden />
      <span className="artlib-breadcrumb__current" aria-current="page">
        Articles
      </span>
    </nav>
  );
}
