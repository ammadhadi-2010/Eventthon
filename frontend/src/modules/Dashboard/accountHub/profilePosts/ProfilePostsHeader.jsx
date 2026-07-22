import React from 'react';
import { FiFileText, FiPlus, FiSearch } from 'react-icons/fi';

export default function ProfilePostsHeader({
  totalCount = 0,
  query = '',
  onQueryChange,
  onCreatePost,
  onWriteArticle,
}) {
  return (
    <header className="pposts-header">
      <div className="pposts-header__top">
        <div className="pposts-header__title-wrap">
          <h2 className="pposts-header__title">My Posts</h2>
          <span className="pposts-header__count">{totalCount}</span>
        </div>
        <div className="pposts-header__actions">
          <button type="button" className="pposts-btn pposts-btn--primary" onClick={onCreatePost}>
            <FiPlus aria-hidden />
            Create Post
          </button>
          <button type="button" className="pposts-btn pposts-btn--secondary" onClick={onWriteArticle}>
            <FiFileText aria-hidden />
            Write Article
          </button>
        </div>
      </div>

      <label className="pposts-search">
        <FiSearch className="pposts-search__icon" aria-hidden />
        <input
          type="search"
          className="pposts-search__input"
          placeholder="Search posts..."
          value={query}
          onChange={(event) => onQueryChange?.(event.target.value)}
          aria-label="Search posts"
        />
      </label>
    </header>
  );
}
