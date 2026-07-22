import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { RELATED_CATEGORIES, normalizeRelatedContent } from './relatedContent/relatedContentConfig';
import { getRelatedItemPath, RELATED_TAB_SHORT_LABELS } from './relatedContent/relatedContentLinks';

export default function ArticleViewRelatedPanel({ relatedContent }) {
  const navigate = useNavigate();
  const related = useMemo(() => normalizeRelatedContent(relatedContent), [relatedContent]);

  const tabsWithItems = useMemo(
    () => RELATED_CATEGORIES.filter((category) => (related[category.key]?.length || 0) > 0),
    [related],
  );

  const [activeKey, setActiveKey] = useState(tabsWithItems[0]?.key || '');

  useEffect(() => {
    if (!tabsWithItems.length) {
      setActiveKey('');
      return;
    }
    if (!tabsWithItems.some((tab) => tab.key === activeKey)) {
      setActiveKey(tabsWithItems[0].key);
    }
  }, [tabsWithItems, activeKey]);

  const activeCategory = RELATED_CATEGORIES.find((row) => row.key === activeKey);
  const activeItems = activeKey ? related[activeKey] || [] : [];

  if (!tabsWithItems.length) {
    return (
      <div className="av-related">
        <h5 className="av-related__title">Related Content</h5>
        <p className="av-related__empty">No related modules attached to this article yet.</p>
      </div>
    );
  }

  return (
    <div className="av-related">
      <h5 className="av-related__title">Related Content</h5>
      <p className="av-related__hint">Tap a tab, then open any linked item.</p>

      <div className="av-related__tabs" role="tablist" aria-label="Related content categories">
        {tabsWithItems.map((category) => {
          const isActive = category.key === activeKey;
          return (
            <button
              key={category.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`av-related__tab av-related__tab--${category.accent}${isActive ? ' av-related__tab--active' : ''}`}
              onClick={() => setActiveKey(category.key)}
            >
              <span className="av-related__tab-icon" aria-hidden>{category.icon}</span>
              <span className="av-related__tab-label">
                {RELATED_TAB_SHORT_LABELS[category.key]}
              </span>
              <span className="av-related__tab-count">{related[category.key].length}</span>
            </button>
          );
        })}
      </div>

      <ul className="av-related__list" role="list">
        {activeItems.map((item) => {
          const path = getRelatedItemPath(activeKey, item);
          return (
            <li key={`${activeKey}-${item.id}`}>
              <button
                type="button"
                className={`av-related__link av-related__link--${activeCategory?.accent || 'blue'}`}
                onClick={() => path && navigate(path)}
                disabled={!path}
              >
                <span className="av-related__link-label">{item.label}</span>
                <FiChevronRight aria-hidden className="av-related__link-icon" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
