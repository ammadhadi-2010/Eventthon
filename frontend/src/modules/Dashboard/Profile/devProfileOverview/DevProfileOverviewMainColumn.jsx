import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProfilePostsSection from '../../accountHub/profilePosts/ProfilePostsSection';
import DevProfileOverviewActivityFeed from './DevProfileOverviewActivityFeed';
import { Code2, Clock, HeartHandshake, ThumbsUp } from 'lucide-react';
import { FiStar } from 'react-icons/fi';
import { resolvePreviewMedia } from '../editProfile/EditProfileLivePreview/livePreviewUtils';
import {
  FEATURE_BULLETS,
} from '../viewFullProfile/viewFullProfileConstants';
import { bioPlain, buildFeaturedProjects, fmtMemberSince } from '../viewFullProfile/viewFullProfileUtils';

const ABOUT_BADGE_ICONS = [Code2, ThumbsUp, Clock, HeartHandshake];

function memberSinceDisplay(userData) {
  const raw = userData?.created_at ?? userData?.createdAt ?? userData?.joined_at;
  if (!raw) return '—';
  const d = new Date(typeof raw === 'string' || typeof raw === 'number' ? raw : String(raw));
  if (Number.isNaN(d.getTime())) return fmtMemberSince(userData) || '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function satisfactionDisplay(gamification) {
  const stars = Number(gamification?.stars_current);
  if (!Number.isFinite(stars) || stars <= 0) return '—';
  return stars.toFixed(1);
}

/** Rich copy + metrics for user-added featured cards only. */
const FEATURED_CARD_PRESETS = {};

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

export default function DevProfileOverviewMainColumn({ activeTab, userData, draft, bundle, refreshData }) {
  void refreshData;
  const bio = bioPlain(draft?.bio);
  const aboutText = bio || 'Add your bio in Edit profile to tell visitors about your work.';
  const hasBio = Boolean(bio);
  const featured = useMemo(() => buildFeaturedProjects(draft?.projects || []), [draft?.projects]);
  const gamification = bundle?.gamification || {};
  const stats = bundle?.stats || {};
  const onTimePct = Number(stats.success_score);
  const onTimeDisplay = Number.isFinite(onTimePct) && onTimePct > 0 ? `${Math.round(onTimePct)}%` : '—';

  if (activeTab === 'activity') {
    return (
      <main className="dpo-main dpo-main--activity">
        <ProfilePostsSection userData={userData} variant="profile" />
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
          <p className="dpo-placeholder">No reviews yet.</p>
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
        {hasBio ? (
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
        ) : null}
        <div className="dpo-about-stats" aria-label="Profile metrics">
          <div className="dpo-about-stat dpo-about-stat--cyan">
            <span className="dpo-about-stat__label">Member Since</span>
            <span className="dpo-about-stat__value">{memberSinceDisplay(userData)}</span>
          </div>
          <div className="dpo-about-stat dpo-about-stat--violet">
            <span className="dpo-about-stat__label">Response Time</span>
            <span className="dpo-about-stat__value">—</span>
          </div>
          <div className="dpo-about-stat dpo-about-stat--amber">
            <span className="dpo-about-stat__label">On-time Delivery</span>
            <span className="dpo-about-stat__value">{onTimeDisplay}</span>
          </div>
          <div className="dpo-about-stat dpo-about-stat--rose">
            <span className="dpo-about-stat__label">Client Satisfaction</span>
            <span className="dpo-about-stat__value dpo-about-stat__value--stars">
              {satisfactionDisplay(gamification)}
              {Number(gamification?.stars_current) > 0 ? (
                <FiStar className="dpo-about-stat__star" aria-hidden />
              ) : null}
            </span>
          </div>
        </div>
      </section>

      {featured.length > 0 ? (
      <section className="dpo-panel dpo-feat-panel">
        <div className="dpo-feat-head">
          <h2 className="dpo-feat-title">Featured Projects</h2>
          <Link to="/profile/edit" className="dpo-feat-viewall">
            View All Projects →
          </Link>
        </div>
        <div className="dpo-feat-grid">
          {featured.map((p) => {
            const img = p.imageUrl ? resolvePreviewMedia(p.imageUrl) : '';
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
                  {metrics[0] || metrics[1] ? (
                    <div className="dpo-feat-metrics">
                      {metrics[0] ? <span className="dpo-feat-metric">{metrics[0]}</span> : null}
                      {metrics[1] ? <span className="dpo-feat-metric">{metrics[1]}</span> : null}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>
      ) : null}

      <DevProfileOverviewActivityFeed userData={userData} draft={draft} bundle={bundle} />
    </main>
  );
}
