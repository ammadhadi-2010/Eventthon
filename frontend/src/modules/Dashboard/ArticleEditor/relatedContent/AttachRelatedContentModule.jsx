import React, { useCallback, useMemo } from 'react';
import { FiInfo } from 'react-icons/fi';
import RelatedCategoryCard from './RelatedCategoryCard';
import RelatedContentRow from './RelatedContentRow';
import { RELATED_CATEGORIES } from './relatedContentConfig';
import './attach-related-content.css';

const DESKTOP_ROWS = [
  RELATED_CATEGORIES.slice(0, 3),
  RELATED_CATEGORIES.slice(3, 6),
];

export default function AttachRelatedContentModule({ value, onChange, userData }) {
  const related = value || {};

  const updateCategory = useCallback(
    (key, rows) => {
      onChange?.({ ...related, [key]: rows });
    },
    [onChange, related],
  );

  const handleAdd = (key, row) => {
    const current = Array.isArray(related[key]) ? related[key] : [];
    if (current.some((item) => item.id === row.id)) return;
    updateCategory(key, [...current, row]);
  };

  const handleRemove = (key, id) => {
    const current = Array.isArray(related[key]) ? related[key] : [];
    updateCategory(
      key,
      current.filter((item) => item.id !== id),
    );
  };

  const attachedCount = useMemo(
    () => RELATED_CATEGORIES.reduce(
      (sum, category) => sum + (related[category.key]?.length || 0),
      0,
    ),
    [related],
  );

  return (
    <section className="arc-module" aria-labelledby="arc-module-title">
      <header className="arc-module__header">
        <div className="arc-module__title-row">
          <h3 id="arc-module-title" className="arc-module__title">
            Attach Related Content
          </h3>
          <span className="arc-module__count">{attachedCount} linked</span>
        </div>
        <p className="arc-module__subtitle">
          <FiInfo aria-hidden className="arc-module__info-icon" />
          Attach related modules to boost SEO, connect content and increase user engagement.
        </p>
      </header>

      <div className="arc-module__rows arc-module__rows--desktop">
        {DESKTOP_ROWS.map((rowCategories) => (
          <RelatedContentRow
            key={rowCategories.map((item) => item.key).join('-')}
            categories={rowCategories}
            related={related}
            userData={userData}
            onAdd={handleAdd}
            onRemove={handleRemove}
            showConnectors
          />
        ))}
      </div>

      <div className="arc-module__scroll arc-module__scroll--mobile">
        {RELATED_CATEGORIES.map((category) => (
          <RelatedCategoryCard
            key={category.key}
            category={category}
            items={related[category.key] || []}
            userData={userData}
            onAdd={(row) => handleAdd(category.key, row)}
            onRemove={(id) => handleRemove(category.key, id)}
            compact
          />
        ))}
      </div>
    </section>
  );
}
