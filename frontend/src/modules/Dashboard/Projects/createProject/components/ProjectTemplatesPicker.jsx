import React, { useMemo, useState } from 'react';
import { FiChevronDown, FiSearch } from 'react-icons/fi';
import WizardTemplateCard from './WizardTemplateCard';
import {
  TEMPLATE_CATEGORY_OPTIONS,
  WIZARD_PROJECT_TEMPLATES,
} from '../data/projectWizardTemplatesData';

export default function ProjectTemplatesPicker({ selectedId, onSelect }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WIZARD_PROJECT_TEMPLATES.filter((tpl) => {
      const matchesCategory = category === 'All categories' || tpl.category === category;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        tpl.title.toLowerCase().includes(q) ||
        tpl.category.toLowerCase().includes(q) ||
        tpl.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [query, category]);

  return (
    <>
      <div className="cp-tpl-toolbar">
        <div className="cp-tpl-search">
          <FiSearch size={16} className="cp-tpl-search__ico" aria-hidden />
          <input
            type="search"
            className="cp-tpl-search__input"
            placeholder="Search templates..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search templates"
          />
        </div>
        <label className="cp-tpl-category">
          <span className="cp-tpl-category__label">Category</span>
          <select
            className="cp-tpl-category__select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            {TEMPLATE_CATEGORY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <FiChevronDown size={16} className="cp-tpl-category__chev" aria-hidden />
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="cp-tpl-empty">No templates match your search. Try another keyword or category.</p>
      ) : (
        <div className="cp-tpl-grid">
          {filtered.map((tpl) => (
            <WizardTemplateCard
              key={tpl.id}
              template={tpl}
              selected={selectedId === tpl.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </>
  );
}
