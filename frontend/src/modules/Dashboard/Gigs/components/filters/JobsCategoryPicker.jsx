import React, { useMemo, useState } from 'react';
import {
  FiSearch,
  FiBriefcase,
  FiCode,
  FiCpu,
  FiTrendingUp,
  FiEdit3,
  FiVideo,
  FiSmartphone,
  FiShare2,
  FiDatabase,
  FiShield,
  FiCloud,
  FiLayers,
  FiTarget,
  FiHeadphones,
  FiDollarSign,
  FiFileText,
  FiGrid,
  FiGlobe,
  FiMusic,
  FiBookOpen,
  FiUser,
} from 'react-icons/fi';
import { buildJobsCategoryFilterOptions } from './filterVariants';

const categoryIcons = {
  code: FiCode,
  cpu: FiCpu,
  trending: FiTrendingUp,
  pen: FiEdit3,
  edit: FiEdit3,
  video: FiVideo,
  smartphone: FiSmartphone,
  briefcase: FiBriefcase,
  shopping: FiBriefcase,
  share: FiShare2,
  database: FiDatabase,
  shield: FiShield,
  cloud: FiCloud,
  layers: FiLayers,
  target: FiTarget,
  headphones: FiHeadphones,
  dollar: FiDollarSign,
  file: FiFileText,
  grid: FiGrid,
  globe: FiGlobe,
  music: FiMusic,
  user: FiUser,
  book: FiBookOpen,
  gamepad: FiGrid,
};

/** Shared jobs category list (browse filter + create alert wizard). */
export default function JobsCategoryPicker({ value = '', onChange, items = null, className = '' }) {
  const [query, setQuery] = useState('');
  const list = useMemo(() => items || buildJobsCategoryFilterOptions(), [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) => item.name.toLowerCase().includes(q));
  }, [list, query]);

  return (
    <div className={`jobs-category-picker ${className}`.trim()}>
      <div className="gigs-panel-search">
        <FiSearch size={12} aria-hidden />
        <input
          type="search"
          placeholder="Search category..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search job category"
        />
      </div>
      <div className="gigs-panel-list jobs-category-picker__list" role="listbox" aria-label="Job category">
        {filtered.map((item) => {
          const Icon = categoryIcons[item.iconKey] || FiGrid;
          const active = value === item.name;
          return (
            <button
              key={item.name}
              type="button"
              role="option"
              aria-selected={active}
              className="gigs-option-row"
              onClick={() => onChange?.(item.name)}
            >
              <span className={`gigs-check ${active ? 'is-active' : ''}`} />
              <span
                className="gigs-category-inline-icon"
                style={{
                  '--icon-gradient': item.iconUi?.gradient,
                  '--icon-glow': item.iconUi?.glow,
                }}
              >
                <Icon size={11} />
              </span>
              <span className="gigs-option-label">{item.name}</span>
              <span className="gigs-option-count">{item.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
