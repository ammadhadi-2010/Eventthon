import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiFilter, FiHelpCircle, FiMoreHorizontal, FiSearch, FiStar, FiUsers, FiCalendar,
} from 'react-icons/fi';
import {
  ACTION_ICONS, CAT_ICONS, DISC_ICONS, EVENT_ICONS, FOOT_ICONS,
} from './communityIcons';
import { resolveCommunityAvatar } from '../utils/communityAvatar';

export default function CommunityHubFeed({
  subtitle,
  actions = [],
  discussions = [],
  categories = [],
  trending = [],
  events = [],
  footerStats = [],
  section = 'overview',
  onSelectSection,
}) {
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [catFilter, setCatFilter] = useState('');
  const [detail, setDetail] = useState(null);
  const [joined, setJoined] = useState({});

  const q = query.trim().toLowerCase();
  const featured = useMemo(() => {
    let rows = discussions;
    if (catFilter) {
      rows = rows.filter((d) =>
        `${d.title} ${d.summary} ${d.tone}`.toLowerCase().includes(catFilter.toLowerCase())
        || d.id.includes(catFilter),
      );
      if (!rows.length) rows = discussions;
    }
    if (!q) return rows;
    return rows.filter((d) => `${d.title} ${d.summary}`.toLowerCase().includes(q));
  }, [discussions, q, catFilter]);

  const trendingRows = useMemo(() => {
    if (!q) return trending;
    return trending.filter((t) => t.title.toLowerCase().includes(q));
  }, [trending, q]);

  const show = (id) => section === 'overview' || section === id;

  const openTopic = (item, kind = 'discussion') => {
    setDetail({
      kind,
      title: item.title,
      body: item.body || item.summary || 'Join the conversation and share your take with the community.',
      replies: item.replies,
      when: item.when,
    });
  };

  if (detail) {
    return (
      <div className="comm-feed">
        <section className="comm-section comm-detail">
          <button type="button" className="comm-detail__back" onClick={() => setDetail(null)}>
            ← Back to community
          </button>
          <h2>{detail.title}</h2>
          {detail.when ? <p className="comm-detail__meta">{detail.when}</p> : null}
          <p>{detail.body}</p>
          {detail.replies != null ? (
            <p className="comm-detail__meta">{detail.replies} replies in this thread</p>
          ) : null}
          <div className="comm-detail__actions">
            <Link to="/company/contact" className="comm-btn-primary">Reply / Ask Support</Link>
            <button type="button" className="comm-filter" onClick={() => setDetail(null)}>Close</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="comm-feed">
      <header className="comm-head">
        <div>
          <div className="comm-head__title-row">
            <span className="comm-head__icon" aria-hidden><FiUsers size={18} /></span>
            <h1>Community</h1>
          </div>
          <p className="comm-head__sub">{subtitle}</p>
        </div>
        <div className="comm-head__tools">
          <label className="comm-search">
            <FiSearch size={14} aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search community…"
              aria-label="Search community"
            />
          </label>
          <button
            type="button"
            className={`comm-filter${filterOpen ? ' is-on' : ''}`}
            onClick={() => setFilterOpen((v) => !v)}
          >
            <FiFilter size={14} aria-hidden /> Filter
          </button>
        </div>
      </header>

      {filterOpen ? (
        <div className="comm-filter-bar" role="group" aria-label="Quick filters">
          <button type="button" className={!catFilter ? 'is-on' : ''} onClick={() => setCatFilter('')}>All</button>
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={catFilter === cat.id ? 'is-on' : ''}
              onClick={() => { setCatFilter(cat.id); onSelectSection?.('discussions'); }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      ) : null}

      {show('overview') || show('ideas') ? (
        <div className="comm-actions">
          {actions.map((item) => {
            const Icon = ACTION_ICONS[item.icon] || FiHelpCircle;
            return (
              <Link key={item.id} to={item.to || '/resources/community'} className={`comm-action tone-${item.tone}`}>
                <span className="comm-action__ico" aria-hidden><Icon size={18} /></span>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
                <em>{item.cta}</em>
              </Link>
            );
          })}
        </div>
      ) : null}

      {show('overview') || show('discussions') || show('announcements') ? (
        <section className="comm-section" id="comm-discussions">
          <div className="comm-section__head">
            <h2>Featured Discussions</h2>
            <button type="button" className="comm-link" onClick={() => onSelectSection?.('discussions')}>
              View All →
            </button>
          </div>
          <div className="comm-discuss">
            {featured.map((item) => {
              const Icon = DISC_ICONS[item.icon] || FiStar;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`comm-discuss__card tone-${item.tone}`}
                  onClick={() => openTopic(item)}
                >
                  <span className="comm-pin">Pinned</span>
                  <span className="comm-discuss__ico" aria-hidden><Icon size={28} /></span>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <div className="comm-discuss__foot">
                    <span className="comm-avatars" aria-hidden>
                      {(item.avatars || []).slice(0, 3).map((a, i) => (
                        <img
                          key={`${item.id}-av-${i}`}
                          src={resolveCommunityAvatar(a, `${item.id}-${i}`)}
                          alt=""
                        />
                      ))}
                    </span>
                    <span>{item.replies} replies</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {show('overview') || show('members') ? (
        <section className="comm-section" id="comm-categories">
          <div className="comm-section__head">
            <h2>Browse by Categories</h2>
          </div>
          <div className="comm-cats">
            {categories.map((cat) => {
              const Icon = CAT_ICONS[cat.icon] || FiUsers;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`comm-cat tone-${cat.tone}${catFilter === cat.id ? ' is-active' : ''}`}
                  onClick={() => {
                    setCatFilter(cat.id);
                    setFilterOpen(true);
                    onSelectSection?.('discussions');
                    document.getElementById('comm-discussions')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span aria-hidden><Icon size={18} /></span>
                  <strong>{cat.label}</strong>
                  <em>{cat.members}</em>
                </button>
              );
            })}
            <button
              type="button"
              className="comm-cat tone-more"
              onClick={() => { setCatFilter(''); setFilterOpen(true); onSelectSection?.('members'); }}
            >
              <span aria-hidden><FiMoreHorizontal size={18} /></span>
              <strong>More</strong>
              <em>See all</em>
            </button>
          </div>
        </section>
      ) : null}

      {(show('overview') || show('leaderboard') || show('events')) ? (
        <div className="comm-split" id="comm-events">
          {(show('overview') || show('leaderboard')) ? (
            <section className="comm-section">
              <div className="comm-section__head">
                <h2>Trending Topics</h2>
                <button type="button" className="comm-link" onClick={() => onSelectSection?.('leaderboard')}>
                  View All
                </button>
              </div>
              <ol className="comm-trending">
                {trendingRows.map((topic, i) => (
                  <li key={topic.id}>
                    <button type="button" className="comm-trending__btn" onClick={() => openTopic(topic, 'topic')}>
                      <span className="comm-trending__n">{i + 1}</span>
                      <span className="comm-trending__body">
                        <strong>{topic.title}</strong>
                        <em>{topic.replies} replies</em>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {(show('overview') || show('events')) ? (
            <section className="comm-section">
              <div className="comm-section__head">
                <h2>Upcoming Events</h2>
              </div>
              <ul className="comm-events">
                {events.map((ev) => {
                  const Icon = EVENT_ICONS[ev.icon] || FiCalendar;
                  const done = Boolean(joined[ev.id]);
                  return (
                    <li key={ev.id} className={`tone-${ev.tone}`}>
                      <span className="comm-events__ico" aria-hidden><Icon size={16} /></span>
                      <button type="button" className="comm-events__body" onClick={() => openTopic(ev, 'event')}>
                        <strong>{ev.title}</strong>
                        <em>{ev.when}</em>
                      </button>
                      <button
                        type="button"
                        className={`comm-btn-primary comm-btn-primary--sm${done ? ' is-done' : ''}`}
                        onClick={() => setJoined((prev) => ({ ...prev, [ev.id]: true }))}
                      >
                        {done ? 'Registered' : ev.cta}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
      ) : null}

      {show('guides') ? (
        <section className="comm-section">
          <div className="comm-section__head"><h2>Community Guides</h2></div>
          <div className="comm-guides">
            <Link to="/resources/guides" className="comm-btn-primary">Open Guides</Link>
            <Link to="/resources/help" className="comm-filter">Help Center</Link>
            <Link to="/resources/tutorials" className="comm-filter">Tutorials</Link>
          </div>
        </section>
      ) : null}

      <div className="comm-footbar" aria-label="Community live stats">
        {footerStats.map((row) => {
          const Icon = FOOT_ICONS[row.icon] || FiUsers;
          return (
            <div key={row.id} className="comm-footbar__item">
              <span aria-hidden><Icon size={16} /></span>
              <div>
                <strong>{row.label}</strong>
                <em>{row.value}</em>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
