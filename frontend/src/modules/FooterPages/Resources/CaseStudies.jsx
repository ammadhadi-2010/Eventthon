import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiFolder, FiGrid, FiList, FiSearch, FiStar } from 'react-icons/fi';
import FooterPageShell from '../components/FooterPageShell';
import CaseStudiesRightRail from '../components/CaseStudiesRightRail';
import useResourcesFooterContent from '../hooks/useResourcesFooterContent';
import { resolveMediaUrl } from '../../../components/shared/utils/resolveMediaUrl';
import {
  CASE_CATEGORIES, CASE_STUDIES, CASE_STUDIES_SUBTITLE,
} from '../data/caseStudiesData';
import '../styles/case-studies.css';

function CaseCard({ story, onOpen }) {
  const cover = resolveMediaUrl(story.imageurl || '');
  const avatar = resolveMediaUrl(story.authorAvatar || '');
  const initial = (story.author || 'E')[0].toUpperCase();
  const metrics = (story.metrics || []).slice(0, 3);
  return (
    <button type="button" className="cs-card" id={`case-${story.id}`} onClick={() => onOpen(story.id)}>
      <div className="cs-card__cover" style={cover ? { backgroundImage: `url(${cover})` } : undefined}>
        <span className="cs-card__tag">{story.categoryLabel || story.category}</span>
      </div>
      <div className="cs-card__body">
        <h3>{story.title}</h3>
        {story.summary ? <p>{story.summary}</p> : null}
        {metrics.length ? (
          <div className="cs-metrics">
            {metrics.map((m) => (
              <span key={`${m.value}-${m.label}`}>
                <strong>{m.value}</strong>
                <em>{m.label}</em>
              </span>
            ))}
          </div>
        ) : null}
        <div className="cs-card__meta">
          <div className="cs-card__by">
            {avatar ? <img className="cs-card__avatar" src={avatar} alt="" /> : (
              <span className="cs-card__avatar" aria-hidden>{initial}</span>
            )}
            <span>
              <strong>{story.author}</strong>
              <span>{[story.date, story.readTime].filter(Boolean).join(' · ')}</span>
            </span>
          </div>
          <span className="cs-card__link">View Case →</span>
        </div>
      </div>
    </button>
  );
}

export default function CaseStudies() {
  const { data, loading } = useResourcesFooterContent('Case Studies');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [view, setView] = useState('grid');
  const [sort, setSort] = useState('latest');

  const stories = data?.stories?.length ? data.stories : CASE_STUDIES;
  const subtitle = data?.subtitle || CASE_STUDIES_SUBTITLE;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = stories.filter((s) => {
      const catOk = category === 'all' || s.category === category;
      if (!catOk) return false;
      if (!q) return true;
      return [s.title, s.summary, s.categoryLabel, s.author].filter(Boolean).join(' ').toLowerCase().includes(q);
    });
    if (sort === 'oldest') rows = [...rows].reverse();
    return rows;
  }, [stories, query, category, sort]);

  const featured = useMemo(
    () => filtered.find((s) => s.featured) || stories.find((s) => s.featured) || null,
    [filtered, stories],
  );
  const gridRows = filtered.filter((s) => !featured || s.id !== featured.id);

  const onOpen = (id) => {
    document.getElementById(`case-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <FooterPageShell variant="resources" rightSlot={<CaseStudiesRightRail />}>
      <div className="cs-page">
        <header className="cs-head">
          <div>
            <div className="cs-head__title-row">
              <Link to="/resources/blog" className="cs-head__back" aria-label="Back">
                <FiArrowLeft size={16} />
              </Link>
              <span className="cs-head__icon" aria-hidden><FiFolder size={16} /></span>
              <h1>Case Studies</h1>
            </div>
            <p className="cs-head__sub">{subtitle}</p>
          </div>
          <div className="cs-head__tools">
            <label className="cs-search">
              <FiSearch size={14} aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search case studies…"
                aria-label="Search case studies"
              />
            </label>
            <div className="cs-view" role="group" aria-label="View mode">
              <button type="button" className={view === 'grid' ? 'is-active' : ''} onClick={() => setView('grid')}>
                <FiGrid size={15} />
              </button>
              <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')}>
                <FiList size={15} />
              </button>
            </div>
          </div>
        </header>

        <div className="cs-filters-row">
          <div className="cs-filters" role="tablist" aria-label="Case categories">
            {CASE_CATEGORIES.map((cat) => (
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
          <select className="cs-sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {loading ? <p className="cs-empty">Loading case studies…</p> : null}

        {!filtered.length ? (
          <p className="cs-empty">No case studies match this filter.</p>
        ) : (
          <>
            <div className={`cs-grid ${view === 'list' ? 'is-list' : ''}`}>
              {(gridRows.length ? gridRows : filtered).map((story) => (
                <CaseCard key={story.id} story={story} onOpen={onOpen} />
              ))}
            </div>

            {featured ? (
              <section className="cs-featured" id={`case-${featured.id}`}>
                <div
                  className="cs-featured__cover"
                  style={featured.imageurl ? { backgroundImage: `url(${resolveMediaUrl(featured.imageurl)})` } : undefined}
                />
                <div>
                  <p className="cs-featured__label"><FiStar size={12} aria-hidden /> Featured Case Study</p>
                  <span className="cs-card__tag" style={{ position: 'static' }}>{featured.categoryLabel}</span>
                  <h3>{featured.title}</h3>
                  {featured.summary ? <p>{featured.summary}</p> : null}
                  {featured.metrics?.length ? (
                    <div className="cs-metrics" style={{ maxWidth: 360 }}>
                      {featured.metrics.slice(0, 3).map((m) => (
                        <span key={`${m.value}-${m.label}`}>
                          <strong>{m.value}</strong>
                          <em>{m.label}</em>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button type="button" className="cs-featured__cta" onClick={() => onOpen(featured.id)}>
                  Read Full Story
                </button>
              </section>
            ) : null}
          </>
        )}
      </div>
    </FooterPageShell>
  );
}
