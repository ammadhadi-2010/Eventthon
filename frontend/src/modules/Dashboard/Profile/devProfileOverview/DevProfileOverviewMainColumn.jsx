import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DevProfileOverviewActivityFeed from './DevProfileOverviewActivityFeed';
import { Code2, Clock, HeartHandshake, ThumbsUp } from 'lucide-react';
import { ReviewCard, toReviewCardProps } from '../../../../components/reviews';
import { FiStar } from 'react-icons/fi';
import { resolvePreviewMedia } from '../editProfile/EditProfileLivePreview/livePreviewUtils';
import {
  DEFAULT_ABOUT,
  FEATURE_BULLETS,
  MOCK_REVIEWS,
  STAR_BARS,
} from '../viewFullProfile/viewFullProfileConstants';
import { bioPlain, buildFeaturedProjects, fmtMemberSince } from '../viewFullProfile/viewFullProfileUtils';

const ABOUT_BADGE_ICONS = [Code2, ThumbsUp, Clock, HeartHandshake];

function memberSinceDisplay(userData) {
  const raw = userData?.created_at ?? userData?.createdAt ?? userData?.joined_at;
  if (!raw) return 'Jan 15, 2024';
  const d = new Date(typeof raw === 'string' || typeof raw === 'number' ? raw : String(raw));
  if (Number.isNaN(d.getTime())) return fmtMemberSince(userData) || 'Jan 15, 2024';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Rich copy + metrics for placeholder featured cards (matches portfolio UI). */
const FEATURED_CARD_PRESETS = {
  'ph-1': {
    desc: 'A comprehensive SEO audit dashboard that analyzes website performance, backlinks, and competitors with actionable reporting.',
    tech: ['React', 'Node.js', 'MongoDB'],
    metrics: ['↑ 150% Traffic', '↓ 35% Bounce Rate'],
    thumbTone: 'seo',
  },
  'ph-2': {
    desc: 'An intelligent chatbot built with NLP that helps businesses automate support and hand off seamlessly to humans.',
    tech: ['Next.js', 'OpenAI API', 'Tailwind CSS'],
    metrics: ['↑ 10K+ Conversations', '↑ 90% Satisfaction'],
    thumbTone: 'ai',
  },
  'ph-3': {
    desc: 'Full-stack e-commerce solution with secure payments, order tracking, and seller tools for modern storefronts.',
    tech: ['Next.js', 'Express.js', 'MongoDB'],
    metrics: ['↑ 550K+ Sales', '↑ 99.9% Uptime'],
    thumbTone: 'shop',
  },
};

function featuredCardDesc(p) {
  const id = String(p.id || '');
  if (FEATURED_CARD_PRESETS[id]) return FEATURED_CARD_PRESETS[id].desc;
  return p.desc || p.description || '';
}

function featuredCardTech(p) {
  const id = String(p.id || '');
  if (FEATURED_CARD_PRESETS[id]) return FEATURED_CARD_PRESETS[id].tech;
  const t = p.tech;
  return Array.isArray(t) ? t.map((x) => String(x)) : [];
}

function featuredCardMetrics(p) {
  const id = String(p.id || '');
  if (FEATURED_CARD_PRESETS[id]) return FEATURED_CARD_PRESETS[id].metrics;
  const kr = Array.isArray(p.keyResults) ? p.keyResults : [];
  const a = p.metric || kr[0] || '↑ High impact';
  const b = kr[1] || '↑ Growth';
  return [String(a), String(b)];
}

function featuredThumbTone(p) {
  const id = String(p.id || '');
  return FEATURED_CARD_PRESETS[id]?.thumbTone || 'generic';
}

function ActivityList({ items }) {
  if (!items?.length) {
    return <p className="dpo-placeholder">No activity yet. Posts you create appear here.</p>;
  }
  return (
    <ul className="dpo-activity-list">
      {items.map((a) => (
        <li key={a.id} className="dpo-activity-item">
          <span className="dpo-activity-type">{a.type}</span>
          <p className="dpo-activity-text">{a.text}</p>
          <time className="dpo-activity-time">{a.created_at}</time>
        </li>
      ))}
    </ul>
  );
}

export default function DevProfileOverviewMainColumn({ activeTab, userData, draft, bundle, refreshData }) {
  void refreshData;
  const [actFilter, setActFilter] = useState('all');
  const aboutText = bioPlain(draft?.bio) || DEFAULT_ABOUT;
  const featured = useMemo(() => buildFeaturedProjects(draft?.projects || []), [draft?.projects]);

  if (activeTab === 'activity') {
    const raw = bundle?.activity || [];
    const filtered =
      actFilter === 'all' ? raw : raw.filter((x) => String(x.type || '').toLowerCase() === actFilter);
    return (
      <main>
        <section className="dpo-panel">
          <h2 className="dpo-panel-title">Activity</h2>
          <div className="dpo-chip-row">
            {['all', 'post', 'project'].map((c) => (
              <button
                key={c}
                type="button"
                className={`dpo-chip${actFilter === c ? ' dpo-chip--on' : ''}`}
                onClick={() => setActFilter(c)}
              >
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>
          <ActivityList items={filtered} />
        </section>
      </main>
    );
  }

  if (activeTab === 'projects') {
    const list = Array.isArray(draft?.projects) ? draft.projects.filter((p) => String(p.title || '').trim()) : [];
    return (
      <main>
        <section className="dpo-panel">
          <h2 className="dpo-panel-title">Projects</h2>
          {!list.length ? (
            <p className="dpo-placeholder">No projects yet. Add them in Edit profile.</p>
          ) : (
            <ul className="dpo-simple-list">
              {list.map((p) => (
                <li key={p.id}>{p.title}</li>
              ))}
            </ul>
          )}
        </section>
      </main>
    );
  }

  if (activeTab === 'skills') {
    const rows = draft?.skillEntries || [];
    return (
      <main>
        <section className="dpo-panel">
          <h2 className="dpo-panel-title">Skills &amp; niche</h2>
          {!rows.length ? (
            <p className="dpo-placeholder">Add skills in Edit profile.</p>
          ) : (
            <div className="dpo-skill-bars">
              {rows.map((s) => (
                <div key={s.id || s.name} className="dpo-skill-bar-row">
                  <span>{s.name}</span>
                  <div className="dpo-skill-bar-track">
                    <span style={{ width: `${Math.min(100, Math.max(0, s.proficiency ?? 80))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    );
  }

  if (activeTab === 'reviews') {
    return (
      <main>
        <section className="dpo-panel">
          <h2 className="dpo-panel-title">Reviews</h2>
          <div className="dpo-rev-summary">
            <strong>4.9</strong>
            <span className="dpo-muted"> / 5</span>
          </div>
          {STAR_BARS.map(([label, pct]) => (
            <div key={label} className="dpo-mini-bar">
              <span>{label}</span>
              <div className="dpo-skill-bar-track">
                <span style={{ width: `${pct}%` }} />
              </div>
              <span>{pct}%</span>
            </div>
          ))}
          <div className="dpo-rev-list">
            {MOCK_REVIEWS.map((r) => (
              <ReviewCard
                key={r.id}
                variant="list"
                {...toReviewCardProps({
                  name: r.name,
                  projectTag: r.projectTag,
                  rating: r.rating,
                  text: r.text,
                  timeAgo: r.timeAgo,
                })}
              />
            ))}
          </div>
        </section>
      </main>
    );
  }

  if (['squads', 'connections', 'followers'].includes(activeTab)) {
    const s = bundle?.stats || {};
    return (
      <main>
        <section className="dpo-panel">
          <h2 className="dpo-panel-title">{activeTab}</h2>
          <p className="dpo-placeholder">
            {activeTab === 'squads' && `Squads: ${s.squads ?? '—'}`}
            {activeTab === 'connections' && `Connections: ${s.connections ?? '—'} (${s.connections_mutual ?? 0} mutual)`}
            {activeTab === 'followers' && `Followers: ${s.followers ?? '—'}`}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="dpo-panel dpo-about-card">
        <h2 className="dpo-about-heading">About Me</h2>
        <p className="dpo-about-lead">{aboutText}</p>
        <div className="dpo-about-badges" role="list">
          {FEATURE_BULLETS.map((t, i) => {
            const Icon = ABOUT_BADGE_ICONS[i % ABOUT_BADGE_ICONS.length];
            return (
              <span key={t} className="dpo-about-badge" role="listitem">
                <Icon className="dpo-about-badge__icon" size={16} strokeWidth={2} aria-hidden />
                {t}
              </span>
            );
          })}
        </div>
        <div className="dpo-about-stats" aria-label="Profile metrics">
          <div className="dpo-about-stat dpo-about-stat--cyan">
            <span className="dpo-about-stat__label">Member Since</span>
            <span className="dpo-about-stat__value">{memberSinceDisplay(userData)}</span>
          </div>
          <div className="dpo-about-stat dpo-about-stat--violet">
            <span className="dpo-about-stat__label">Response Time</span>
            <span className="dpo-about-stat__value">2 hrs</span>
          </div>
          <div className="dpo-about-stat dpo-about-stat--amber">
            <span className="dpo-about-stat__label">On-time Delivery</span>
            <span className="dpo-about-stat__value">{bundle?.stats?.success_score ?? 98}%</span>
          </div>
          <div className="dpo-about-stat dpo-about-stat--rose">
            <span className="dpo-about-stat__label">Client Satisfaction</span>
            <span className="dpo-about-stat__value dpo-about-stat__value--stars">
              4.9
              <FiStar className="dpo-about-stat__star" aria-hidden />
            </span>
          </div>
        </div>
      </section>

      <section className="dpo-panel dpo-feat-panel">
        <div className="dpo-feat-head">
          <h2 className="dpo-feat-title">Featured Projects</h2>
          <Link to="/profile/edit" className="dpo-feat-viewall">
            View All Projects →
          </Link>
        </div>
        <div className="dpo-feat-grid">
          {featured.map((p) => {
            const isPh = String(p.id || '').startsWith('ph-');
            const img = p.imageUrl && !isPh ? resolvePreviewMedia(p.imageUrl) : '';
            const tone = featuredThumbTone(p);
            const tech = featuredCardTech(p);
            const metrics = featuredCardMetrics(p);
            return (
              <article key={p.id} className="dpo-feat-card">
                <div className={`dpo-feat-card__thumb dpo-feat-card__thumb--${tone}`}>
                  {img ? <img src={img} alt="" className="dpo-feat-card__thumb-img" /> : null}
                </div>
                <div className="dpo-feat-card__body">
                  <h3 className="dpo-feat-card__title">{p.title}</h3>
                  <p className="dpo-feat-card__desc">{featuredCardDesc(p)}</p>
                  {tech.length ? (
                    <div className="dpo-feat-tags">
                      {tech.map((t) => (
                        <span key={t} className="dpo-feat-tag">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="dpo-feat-metrics">
                    <span className="dpo-feat-metric">{metrics[0]}</span>
                    <span className="dpo-feat-metric">{metrics[1]}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <DevProfileOverviewActivityFeed userData={userData} draft={draft} bundle={bundle} />
    </main>
  );
}
