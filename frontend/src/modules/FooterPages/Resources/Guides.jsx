import React, { useMemo, useState } from 'react';
import {
  FiBookOpen, FiBriefcase, FiClipboard, FiCreditCard, FiFolder, FiGift,
  FiGlobe, FiSearch, FiTrendingUp, FiUser, FiUsers, FiDollarSign, FiHome,
} from 'react-icons/fi';
import FooterPageShell from '../components/FooterPageShell';
import GuidesRightRail from '../components/GuidesRightRail';
import useResourcesFooterContent from '../hooks/useResourcesFooterContent';
import { GUIDE_CATEGORIES, GUIDES, GUIDES_SUBTITLE } from '../data/guidesData';
import '../styles/guides.css';

const ICONS = {
  rocket: FiBookOpen,
  user: FiUser,
  users: FiUsers,
  trending: FiTrendingUp,
  briefcase: FiBriefcase,
  folder: FiFolder,
  clipboard: FiClipboard,
  wallet: FiDollarSign,
  gift: FiGift,
  card: FiCreditCard,
  building: FiHome,
  globe: FiGlobe,
};

function levelClass(level = '') {
  const t = level.toLowerCase();
  if (t.includes('advanced')) return 'is-advanced';
  if (t.includes('intermediate')) return 'is-intermediate';
  return 'is-beginner';
}

function GuideCard({ guide, onOpen }) {
  const Icon = ICONS[guide.icon] || FiBookOpen;
  const pct = Math.min(100, Math.max(0, Number(guide.progress) || 0));
  return (
    <button type="button" className="guides-card" onClick={() => onOpen(guide.id)}>
      <div className="guides-card__top">
        <span className="guides-card__icon" aria-hidden><Icon size={18} /></span>
        <span className={`guides-card__level ${levelClass(guide.level)}`}>{guide.level}</span>
      </div>
      <h3>{guide.title}</h3>
      {guide.summary ? <p>{guide.summary}</p> : null}
      <div className="guides-card__meta">
        <span>{guide.time} read</span>
        {guide.steps ? <span>{guide.steps} steps</span> : null}
      </div>
      <div className="guides-card__progress">
        <div className="guides-card__bar" aria-hidden>
          <span className={pct >= 100 ? 'is-done' : ''} style={{ width: `${pct}%` }} />
        </div>
        <p className="guides-card__pct">{pct}% Complete</p>
      </div>
    </button>
  );
}

export default function Guides() {
  const { data, loading } = useResourcesFooterContent('Guides');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [activeId, setActiveId] = useState('');

  const guides = data?.guides?.length ? data.guides : GUIDES;
  const subtitle = data?.subtitle || GUIDES_SUBTITLE;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guides.filter((g) => {
      const catOk = category === 'all' || g.category === category;
      if (!catOk) return false;
      if (!q) return true;
      return [g.title, g.summary, g.level, g.category].filter(Boolean).join(' ').toLowerCase().includes(q);
    });
  }, [guides, query, category]);

  const featured = filtered.filter((g) => g.featured !== false).slice(0, 8);
  const listed = filtered.filter((g) => g.featured === false);

  const onOpen = (id) => {
    setActiveId(id);
    document.getElementById(`guide-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <FooterPageShell variant="resources" rightSlot={<GuidesRightRail onOpenGuide={onOpen} />}>
      <div className="guides-page">
        <header className="guides-head">
          <div>
            <div className="guides-head__title-row">
              <span className="guides-head__icon" aria-hidden><FiBookOpen size={22} /></span>
              <h1>Guides</h1>
            </div>
            <p className="guides-head__sub">{subtitle}</p>
          </div>
          <label className="guides-search">
            <FiSearch size={14} aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search guides…"
              aria-label="Search guides"
            />
          </label>
        </header>

        <div className="guides-filters" role="tablist" aria-label="Guide categories">
          {GUIDE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={category === cat.id}
              className={category === cat.id ? 'is-active' : ''}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? <p className="guides-empty">Loading guides…</p> : null}

        {!filtered.length ? (
          <p className="guides-empty">No guides match this filter.</p>
        ) : (
          <>
            <div className="guides-grid">
              {(featured.length ? featured : filtered).map((guide) => (
                <div key={guide.id} id={`guide-${guide.id}`} className={activeId === guide.id ? 'is-focus' : ''}>
                  <GuideCard guide={guide} onOpen={onOpen} />
                </div>
              ))}
            </div>
            {listed.length ? (
              <div className="guides-list">
                {listed.map((guide) => (
                  <button
                    key={guide.id}
                    id={`guide-${guide.id}`}
                    type="button"
                    className="guides-list__item"
                    onClick={() => onOpen(guide.id)}
                  >
                    <span>
                      <strong>{guide.title}</strong>
                      <span>{guide.time} · {guide.level}</span>
                    </span>
                    <span>{Math.min(100, Number(guide.progress) || 0)}%</span>
                  </button>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </FooterPageShell>
  );
}
