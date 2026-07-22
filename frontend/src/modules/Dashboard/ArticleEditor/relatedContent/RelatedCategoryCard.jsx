import React, { useEffect, useRef, useState } from 'react';
import { FiPlus, FiSearch } from 'react-icons/fi';
import RelatedItemPillTag from './RelatedItemPillTag';
import { searchRelatedContent } from './relatedContentSearch';

export default function RelatedCategoryCard({
  category,
  items = [],
  userData,
  onAdd,
  onRemove,
  compact = false,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!pickerOpen) return undefined;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const rows = await searchRelatedContent(category.key, query, userData);
        const attachedIds = new Set(items.map((item) => item.id));
        setResults(rows.filter((row) => !attachedIds.has(row.id)));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => window.clearTimeout(timer);
  }, [category.key, query, pickerOpen, items, userData]);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) setPickerOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleSelect = (row) => {
    onAdd(row);
    setQuery('');
    setPickerOpen(false);
  };

  const openPicker = () => {
    setPickerOpen(true);
  };

  return (
    <article
      ref={wrapRef}
      className={`arc-card arc-card--${category.accent}${compact ? ' arc-card--compact' : ''}`}
      aria-label={category.title}
    >
      <div className="arc-card__head">
        <div className={`arc-card__icon-wrap arc-card__icon-wrap--${category.accent}`}>
          <span className="arc-card__icon" aria-hidden>{category.icon}</span>
        </div>
        <div className="arc-card__head-copy">
          <h4 className="arc-card__title">{category.title}</h4>
          <span className="arc-card__count">{items.length} attached</span>
        </div>
      </div>

      <label className="arc-card__search-wrap">
        <FiSearch className="arc-card__search-icon" aria-hidden />
        <input
          type="search"
          className="arc-card__search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPickerOpen(true);
          }}
          onFocus={openPicker}
          placeholder={category.placeholder}
          aria-label={category.placeholder}
        />
      </label>

      <div className="arc-card__tags">
        {items.length ? (
          items.map((item) => (
            <RelatedItemPillTag
              key={item.id}
              label={item.label}
              accent={category.accent}
              onRemove={() => onRemove(item.id)}
            />
          ))
        ) : (
          <span className="arc-card__empty">No items attached yet</span>
        )}
      </div>

      <button
        type="button"
        className={`arc-card__attach arc-card__attach--${category.accent}`}
        onClick={() => setPickerOpen((open) => !open)}
      >
        <FiPlus aria-hidden /> Attach
      </button>

      {pickerOpen ? (
        <div className="arc-card__picker" role="listbox" aria-label={`${category.title} results`}>
          {loading ? (
            <p className="arc-card__picker-status">Searching…</p>
          ) : results.length ? (
            results.map((row) => (
              <button
                key={row.id}
                type="button"
                className="arc-card__picker-item"
                onClick={() => handleSelect(row)}
                role="option"
              >
                {row.label}
              </button>
            ))
          ) : (
            <p className="arc-card__picker-status">
              {query.trim() ? 'No matches found.' : 'Type to search or pick from suggestions.'}
            </p>
          )}
        </div>
      ) : null}
    </article>
  );
}
