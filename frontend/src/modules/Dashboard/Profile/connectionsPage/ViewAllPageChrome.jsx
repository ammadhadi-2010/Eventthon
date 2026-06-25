import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Filter, Search } from 'lucide-react';

export default function ViewAllPageChrome({
  isHeaderVisible,
  pageTitle,
  subtitle,
  searchPlaceholder,
  query,
  onQueryChange,
  onlineOnly,
  onToggleOnline,
}) {
  return (
    <div
      className={`pnet-chrome${isHeaderVisible ? '' : ' pnet-chrome--hidden'}`}
      aria-hidden={!isHeaderVisible}
    >
      <header className="pnet-main__head">
        <Link to="/dashboard" className="pnet-back" aria-label="Back to home">
          <ArrowLeft size={18} strokeWidth={2} />
        </Link>
        <div className="pnet-main__titles">
          <h1 className="pnet-main__title">{pageTitle}</h1>
          <p className="pnet-main__sub">{subtitle}</p>
        </div>
      </header>

      <div className="pnet-toolbar">
        <div className="pnet-search pnet-search--inline">
          <span className="pnet-search__ico" aria-hidden>
            <Search size={17} strokeWidth={2} />
          </span>
          <input
            type="search"
            className="pnet-search__input"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Search this list"
          />
        </div>
        <button
          type="button"
          className={`pnet-filter${onlineOnly ? ' is-on' : ''}`}
          onClick={onToggleOnline}
        >
          <Filter size={15} strokeWidth={2} aria-hidden />
          Filters{onlineOnly ? ' · Online' : ''}
        </button>
      </div>
    </div>
  );
}
