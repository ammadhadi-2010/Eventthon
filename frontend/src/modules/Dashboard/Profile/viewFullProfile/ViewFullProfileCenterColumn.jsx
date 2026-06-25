import React from 'react';
import { ReviewCard, StarRating, toReviewCardProps } from '../../../../components/reviews';
import { resolvePreviewMedia } from '../editProfile/EditProfileLivePreview/livePreviewUtils';
import {
  DEFAULT_ABOUT,
  FEATURE_BULLETS,
  MOCK_REVIEWS,
  STAR_BARS,
} from './viewFullProfileConstants';
import { bioPlain, perfRows } from './viewFullProfileUtils';

export default function ViewFullProfileCenterColumn({ draft, featuredProjects, projectCount }) {
  const aboutText = bioPlain(draft.bio) || DEFAULT_ABOUT;
  const skillTags = (draft.skillEntries || []).map((s) => s.name).filter(Boolean).slice(0, 12);
  const perf = perfRows(projectCount);
  const experiences = Array.isArray(draft.experiences)
    ? draft.experiences.filter((x) => String(x.role || '').trim() || String(x.company || '').trim())
    : [];

  return (
    <div className="vfps-maincol">
      <section className="vfps-card" id="vfps-section-about">
        <h2 className="vfps-card-title">About me</h2>
        <p className="vfps-muted">{aboutText}</p>
        <div className="vfps-benefits">
          {FEATURE_BULLETS.map((t) => (
            <span key={t} className="vfps-benefit-pill">
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className="vfps-card" id="vfps-section-skills">
        <h2 className="vfps-card-title">Top skills</h2>
        <div className="vfps-skill-cloud vfps-skill-cloud--flush">
          {(skillTags.length ? skillTags : ['React', 'Node.js', 'TypeScript', 'UI/UX']).map((t) => (
            <span key={t} className="vfps-tag">
              {t}
            </span>
          ))}
        </div>
        <h2 className="vfps-card-title" style={{ marginTop: '0.5rem' }}>
          Performance
        </h2>
        <div className="vfps-perf">
          {perf.map((p) => (
            <div key={p.label} className="vfps-perf-item">
              <div className="vfps-perf-val">{p.value}</div>
              <div className="vfps-perf-lab">{p.label}</div>
            </div>
          ))}
        </div>
      </section>

      {experiences.length > 0 ? (
        <section className="vfps-card" id="vfps-section-experience">
          <h2 className="vfps-card-title">Experience</h2>
          <ul className="vfps-exp-list">
            {experiences.map((ex) => (
              <li key={ex.id} className="vfps-exp-item">
                <div className="vfps-exp-row">
                  {ex.logoUrl ? (
                    <div className="vfps-exp-logo">
                      <img src={ex.logoUrl} alt="" />
                    </div>
                  ) : (
                    <div className="vfps-exp-logo vfps-exp-logo--ph" aria-hidden>
                      {(ex.company || ex.role || '?').charAt(0)}
                    </div>
                  )}
                  <div className="vfps-exp-body">
                    <div className="vfps-exp-head">
                      <h3 className="vfps-exp-role">{ex.role || 'Role'}</h3>
                      <span className="vfps-exp-co">{ex.company || '—'}</span>
                    </div>
                    <p className="vfps-exp-period">
                      {[ex.period, ex.durationLabel].filter(Boolean).join(' · ') || '—'}
                      {ex.current ? <span className="vfps-exp-current"> · Present</span> : null}
                    </p>
                    {ex.desc ? <p className="vfps-exp-desc">{ex.desc}</p> : null}
                    {ex.tags?.length ? (
                      <div className="vfps-exp-tags">
                        {ex.tags.slice(0, 6).map((t) => (
                          <span key={t} className="vfps-tag vfps-tag--sm">
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="vfps-card" id="vfps-section-projects">
        <h2 className="vfps-card-title">Featured projects</h2>
        <div className="vfps-projects">
          {featuredProjects.map((p) => {
            const isPh = String(p.id || '').startsWith('ph-');
            const img = p.imageUrl && !isPh ? resolvePreviewMedia(p.imageUrl) : '';
            return (
              <article key={p.id} className="vfps-project">
                <span className="vfps-project-badge">Featured</span>
                <div className="vfps-project-thumb">
                  {img ? (
                    <img src={img} alt="" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', minHeight: 120 }} />
                  )}
                </div>
                <div className="vfps-project-body">
                  <h3 className="vfps-project-title">{p.title}</h3>
                  <p className="vfps-project-desc">{p.desc || p.description || ''}</p>
                  {p.tech?.length ? (
                    <div className="vfps-project-tech">
                      {p.tech.slice(0, 4).map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  ) : null}
                  <div className="vfps-project-meta">
                    {p.metric || (p.keyResults && p.keyResults[0]) || 'High impact delivery'}
                  </div>
                  <a
                    className="vfps-project-link"
                    href={p.linkUrl || '#'}
                    onClick={(e) => !p.linkUrl && e.preventDefault()}
                  >
                    View project →
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="vfps-card vfps-card--reviews" id="vfps-section-reviews">
        <div className="vfps-reviews-cardhead">
          <h2 className="vfps-reviews-cardtitle">Reviews &amp; Ratings</h2>
          <a href="#reviews" className="vfps-reviews-viewall" onClick={(e) => e.preventDefault()}>
            View All Reviews →
          </a>
        </div>
        <div className="vfps-reviews-body">
          <div className="vfps-reviews-summary">
            <div className="vfps-reviews-score">
              <div className="vfps-reviews-scoreline">
                <span className="vfps-reviews-num">4.9</span>
                <StarRating rating={4.9} className="vfps-reviews-stars vfps-reviews-stars--hero" iconSize={16} />
              </div>
              <p className="vfps-reviews-count">(128 reviews)</p>
            </div>
            <div className="vfps-reviews-dist" aria-label="Rating distribution">
              {STAR_BARS.map(([label, pct]) => (
                <div key={label} className="vfps-dist-row">
                  <span className="vfps-dist-label">{label}</span>
                  <div className="vfps-dist-track">
                    <div className="vfps-dist-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="vfps-dist-pct">{pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="vfps-review-list">
            {MOCK_REVIEWS.map((r) => (
              <ReviewCard
                key={r.id}
                variant="list"
                className="vfps-review-item"
                showReply
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
        </div>
        <button type="button" className="vfps-load">
          Load More Reviews
        </button>
      </section>
    </div>
  );
}
