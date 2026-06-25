import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiShare2 } from 'react-icons/fi';

const INLINE_SUB_PILLS_MAX = 4;

/**
 * Category marketplace center: breadcrumb, hero (icon + title + counts + share),
 * subcategory pills (from global catalog), sort toolbar, then list slot (children).
 */
const GigsCategoryProvidersCenter = ({
  category,
  categoryMeta,
  CategoryIcon,
  gigTotalRemote,
  toolbarListCount,
  shownFrom,
  shownTo,
  sortLabel,
  onSortChange,
  sortOptions = [],
  selectedSubcategory,
  onSelectSubcategory,
  onShareCategory,
  children,
}) => {
  const subcategories = Array.isArray(categoryMeta?.subcategories) ? categoryMeta.subcategories : [];
  const visibleSubs = subcategories.slice(0, INLINE_SUB_PILLS_MAX);
  const overflowSubs = subcategories.slice(INLINE_SUB_PILLS_MAX);

  const [moreOpen, setMoreOpen] = useState(false);
  const moreWrapRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!moreWrapRef.current || moreWrapRef.current.contains(e.target)) return;
      setMoreOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pickSub = useCallback(
    (value) => {
      onSelectSubcategory(value);
      setMoreOpen(false);
    },
    [onSelectSubcategory],
  );

  useEffect(() => {
    setMoreOpen(false);
  }, [category]);

  const subtitleCount =
    gigTotalRemote === 1 ? '1 gig available' : `${gigTotalRemote} gigs available`;

  return (
    <main className="gigs-catbp-main">
      <nav className="gigs-catbp-breadcrumb" aria-label="Breadcrumb">
        Gigs <span className="gigs-catbp-bc-sep">›</span> {category}
      </nav>

      <header className="gigs-catbp-main-head gigs-catbp-main-head--compact">
        <div className="gigs-catbp-main-head-row">
          <div
            className="gigs-catbp-title-icon gigs-popular-icon gigs-catbp-title-icon--compact"
            style={
              categoryMeta?.iconUi
                ? { '--icon-gradient': categoryMeta.iconUi.gradient, '--icon-glow': categoryMeta.iconUi.glow }
                : {}
            }
          >
            <CategoryIcon size={20} aria-hidden />
          </div>
          <div className="gigs-catbp-main-head-text">
            <h1 className="gigs-catbp-main-title">{category}</h1>
            <p className="gigs-catbp-hero-meta">{subtitleCount}</p>
          </div>
          <button type="button" className="gigs-catbp-share gigs-catbp-share--compact" onClick={onShareCategory}>
            <FiShare2 size={14} aria-hidden /> Share
          </button>
        </div>
      </header>

      {subcategories.length > 0 ? (
        <div className="gigs-catbp-pills" role="toolbar" aria-label="Subcategories">
          <button
            type="button"
            className={`gigs-catbp-pill${selectedSubcategory ? '' : ' is-active'}`}
            onClick={() => pickSub('')}
          >
            All Services
          </button>
          {visibleSubs.map((label) => (
            <button
              key={label}
              type="button"
              className={`gigs-catbp-pill${selectedSubcategory === label ? ' is-active' : ''}`}
              onClick={() => pickSub(label)}
            >
              {label}
            </button>
          ))}
          {overflowSubs.length > 0 ? (
            <div className={`gigs-catbp-more${moreOpen ? ' is-open' : ''}`} ref={moreWrapRef}>
              <button
                type="button"
                className={`gigs-catbp-pill gigs-catbp-pill--more${overflowSubs.some((s) => s === selectedSubcategory) ? ' is-active' : ''}`}
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((o) => !o)}
              >
                More <FiChevronDown size={14} aria-hidden />
              </button>
              {moreOpen ? (
                <ul className="gigs-catbp-more-menu" role="listbox">
                  {overflowSubs.map((label) => (
                    <li key={label} role="none">
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedSubcategory === label}
                        className={`gigs-catbp-more-option${selectedSubcategory === label ? ' is-active' : ''}`}
                        onClick={() => pickSub(label)}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="gigs-catbp-toolbar">
        <p className="gigs-catbp-toolbar-meta">
          Showing{' '}
          <strong>
            {shownFrom}–{shownTo}
          </strong>{' '}
          of <strong>{toolbarListCount}</strong> gigs
        </p>
        <label className="gigs-catbp-sort">
          <span>Sort by</span>
          <div className="gigs-catbp-sort-select-wrap">
            <select
              value={sortLabel}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="Sort gigs"
            >
              {sortOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <FiChevronDown className="gigs-catbp-sort-chev" aria-hidden />
          </div>
        </label>
      </div>

      {children}
    </main>
  );
};

export default GigsCategoryProvidersCenter;
