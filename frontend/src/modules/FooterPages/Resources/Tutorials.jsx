import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowLeft, FiBriefcase, FiClipboard, FiDollarSign, FiFolder,
  FiGrid, FiList, FiPlay, FiSearch, FiUsers, FiZap,
} from 'react-icons/fi';
import FooterPageShell from '../components/FooterPageShell';
import TutorialsRightRail from '../components/TutorialsRightRail';
import useResourcesFooterContent from '../hooks/useResourcesFooterContent';
import {
  POPULAR_TUTORIALS, TUTORIAL_CATEGORIES, TUTORIALS, TUTORIALS_SUBTITLE,
} from '../data/tutorialsData';
import '../styles/tutorials.css';

const CAT_ICONS = {
  play: FiPlay,
  rocket: FiZap,
  users: FiUsers,
  briefcase: FiBriefcase,
  folder: FiFolder,
  clipboard: FiClipboard,
  wallet: FiDollarSign,
};

function levelClass(level = '') {
  const t = level.toLowerCase();
  if (t.includes('advanced')) return 'is-advanced';
  if (t.includes('intermediate')) return 'is-intermediate';
  return 'is-beginner';
}

function thumbTone(category = '') {
  if (category === 'gigs') return 'is-gigs';
  if (category === 'wallet') return 'is-wallet';
  return '';
}

function openVideo(item) {
  if (item?.videoUrl) {
    window.open(item.videoUrl, '_blank', 'noopener,noreferrer');
  }
}

function FeaturedCard({ item, onOpen }) {
  return (
    <button type="button" className="tut-card" onClick={() => onOpen(item.id)}>
      <div
        className={`tut-card__thumb ${thumbTone(item.category)}`}
        style={item.imageurl ? { backgroundImage: `url(${item.imageurl})` } : undefined}
      >
        <span className="tut-card__play" aria-hidden><FiPlay size={18} /></span>
        <span className="tut-card__dur">{item.duration}</span>
      </div>
      <div className="tut-card__body">
        <h3>{item.title}</h3>
        {item.summary ? <p>{item.summary}</p> : null}
        <div className="tut-card__meta">
          <span className={`tut-level ${levelClass(item.level)}`}>{item.level}</span>
          <span>{item.duration}</span>
          <span>{item.lessons || 0} lessons</span>
        </div>
      </div>
    </button>
  );
}

function ListRow({ item, onOpen }) {
  return (
    <button type="button" className="tut-list__item" id={`tutorial-${item.id}`} onClick={() => onOpen(item.id)}>
      <div className="tut-list__thumb" aria-hidden>
        <FiPlay size={14} />
        <span>{item.duration}</span>
      </div>
      <div className="tut-list__body">
        <strong>{item.title}</strong>
        {item.summary ? <p>{item.summary}</p> : null}
        <div className="tut-list__meta">{item.lessons || 0} lessons · {item.duration}</div>
      </div>
      <div className="tut-list__side">
        <span className={`tut-level ${levelClass(item.level)}`}>{item.level}</span>
      </div>
    </button>
  );
}

export default function Tutorials() {
  const { data, loading } = useResourcesFooterContent('Tutorials');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [view, setView] = useState('list');

  const tutorials = data?.tutorials?.length ? data.tutorials : TUTORIALS;
  const subtitle = data?.subtitle || TUTORIALS_SUBTITLE;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tutorials.filter((t) => {
      const catOk = category === 'all' || t.category === category;
      if (!catOk) return false;
      if (!q) return true;
      return [t.title, t.summary, t.level, t.category].filter(Boolean).join(' ').toLowerCase().includes(q);
    });
  }, [tutorials, query, category]);

  const featured = useMemo(() => {
    const rows = filtered.filter((t) => t.featured !== false);
    return (rows.length ? rows : filtered).slice(0, 3);
  }, [filtered]);

  const listed = useMemo(() => {
    const featuredIds = new Set(featured.map((t) => t.id));
    const rest = filtered.filter((t) => !featuredIds.has(t.id));
    return rest.length ? rest : filtered.filter((t) => t.featured === false);
  }, [filtered, featured]);

  const categoryChips = useMemo(() => (
    TUTORIAL_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => ({
      ...cat,
      count: tutorials.filter((t) => t.category === cat.id).length,
    }))
  ), [tutorials]);

  const popular = useMemo(() => {
    if (data?.fromCms) {
      return tutorials.slice(0, 5).map((t) => ({
        id: t.id,
        title: t.title,
        meta: `${t.duration} · ${t.level}`,
      }));
    }
    return POPULAR_TUTORIALS;
  }, [data?.fromCms, tutorials]);

  const onOpen = (id) => {
    const item = tutorials.find((t) => t.id === id);
    if (item?.videoUrl) openVideo(item);
    document.getElementById(`tutorial-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <FooterPageShell variant="resources" rightSlot={<TutorialsRightRail onOpen={onOpen} popular={popular} />}>
      <div className="tut-page">
        <header className="tut-head">
          <div>
            <div className="tut-head__title-row">
              <Link to="/resources/guides" className="tut-head__back" aria-label="Back to Guides">
                <FiArrowLeft size={16} />
              </Link>
              <h1>Tutorials</h1>
            </div>
            <p className="tut-head__sub">{subtitle}</p>
          </div>
          <div className="tut-head__tools">
            <label className="tut-search">
              <FiSearch size={14} aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tutorials…"
                aria-label="Search tutorials"
              />
            </label>
            <div className="tut-view" role="group" aria-label="View mode">
              <button type="button" className={view === 'grid' ? 'is-active' : ''} aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
                <FiGrid size={15} />
              </button>
              <button type="button" className={view === 'list' ? 'is-active' : ''} aria-pressed={view === 'list'} onClick={() => setView('list')}>
                <FiList size={15} />
              </button>
            </div>
          </div>
        </header>

        {loading ? <p className="tut-empty">Loading tutorials…</p> : null}

        {!filtered.length ? (
          <p className="tut-empty">No tutorials match this filter.</p>
        ) : (
          <>
            <h2 className="tut-section-title">Featured Tutorials</h2>
            <div className="tut-featured">
              {featured.map((item) => (
                <FeaturedCard key={item.id} item={item} onOpen={onOpen} />
              ))}
            </div>

            <h2 className="tut-section-title">Tutorial Categories</h2>
            <div className="tut-cats" role="tablist" aria-label="Tutorial categories">
              {categoryChips.map((cat) => {
                const Icon = CAT_ICONS[cat.icon] || FiPlay;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={category === cat.id}
                    className={category === cat.id ? 'is-active' : ''}
                    onClick={() => setCategory((prev) => (prev === cat.id ? 'all' : cat.id))}
                  >
                    <span className="tut-cats__icon" aria-hidden><Icon size={16} /></span>
                    <span>
                      <strong>{cat.label}</strong>
                      <em>{cat.count} videos</em>
                    </span>
                  </button>
                );
              })}
            </div>

            <h2 className="tut-section-title" id="all-tutorials">All Tutorials</h2>
            {view === 'grid' ? (
              <div className="tut-grid-all">
                {(listed.length ? listed : filtered).map((item) => (
                  <FeaturedCard key={item.id} item={item} onOpen={onOpen} />
                ))}
              </div>
            ) : (
              <div className="tut-list">
                {(listed.length ? listed : filtered).map((item) => (
                  <ListRow key={item.id} item={item} onOpen={onOpen} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </FooterPageShell>
  );
}
