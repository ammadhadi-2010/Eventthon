import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiHeadphones, FiBookOpen } from 'react-icons/fi';
import { DOC_NAV_GROUPS } from '../data/documentationData';
import { CONTACT_SUPPORT_PATH } from './FooterCtaAside';

export default function DocsSideNav({ activeId, onSelect, query, onQueryChange }) {
  const groups = useMemo(() => {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return DOC_NAV_GROUPS;
    return DOC_NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLowerCase().includes(q)),
    })).filter((group) => group.items.length);
  }, [query]);

  return (
    <nav className="docs-side" aria-label="Documentation topics">
      <div className="docs-side__search">
        <FiBookOpen size={14} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search docs…"
          aria-label="Search documentation"
        />
      </div>

      {groups.map((group) => (
        <div key={group.id} className="docs-side__group">
          <p className="docs-side__label">{group.label}</p>
          <ul className="docs-side__list">
            {group.items.map((item) => {
              if (item.to) {
                return (
                  <li key={item.id}>
                    <Link to={item.to} className="docs-side__link">{item.label}</Link>
                  </li>
                );
              }
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`docs-side__link${activeId === item.id ? ' is-active' : ''}`}
                    onClick={() => onSelect(item.id)}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="docs-side__help">
        <p>Still need help?</p>
        <Link to={CONTACT_SUPPORT_PATH} className="docs-side__help-btn">
          <FiHeadphones size={14} aria-hidden /> Contact Support
        </Link>
      </div>
    </nav>
  );
}
