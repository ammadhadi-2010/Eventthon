import React from 'react';
import { resolvePreviewMedia } from '../editProfile/EditProfileLivePreview/livePreviewUtils';
import { bioPlain, perfRows } from './viewFullProfileUtils';

export default function ViewFullProfileCenterColumn({ draft, featuredProjects, projectCount, stats = {} }) {
  const bio = bioPlain(draft.bio);
  const aboutText = bio || 'Add your bio in Edit profile to tell visitors about your work.';
  const skillTags = (draft.skillEntries || []).map((s) => s.name).filter(Boolean).slice(0, 12);
  const perf = perfRows(projectCount, stats);
  const experiences = Array.isArray(draft.experiences)
    ? draft.experiences.filter((x) => String(x.role || '').trim() || String(x.company || '').trim())
    : [];

  return (
    <div className="vfps-maincol">
      <section className="vfps-card" id="vfps-section-about">
        <h2 className="vfps-card-title">About me</h2>
        <p className="vfps-muted">{aboutText}</p>
      </section>

      <section className="vfps-card" id="vfps-section-skills">
        <h2 className="vfps-card-title">Top skills</h2>
        {skillTags.length ? (
          <div className="vfps-skill-cloud vfps-skill-cloud--flush">
            {skillTags.map((t) => (
              <span key={t} className="vfps-tag">
                {t}
              </span>
            ))}
          </div>
        ) : (
          <p className="vfps-muted">Add skills in Edit profile.</p>
        )}
        {perf.length ? (
          <>
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
          </>
        ) : null}
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

      {featuredProjects.length > 0 ? (
        <section className="vfps-card" id="vfps-section-projects">
          <h2 className="vfps-card-title">Featured projects</h2>
          <div className="vfps-projects">
            {featuredProjects.map((p) => {
              const img = p.imageUrl ? resolvePreviewMedia(p.imageUrl) : '';
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
                    {(p.metric || p.keyResults?.[0]) ? (
                      <div className="vfps-project-meta">
                        {p.metric || p.keyResults[0]}
                      </div>
                    ) : null}
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
      ) : null}

      <section className="vfps-card vfps-card--reviews" id="vfps-section-reviews">
        <div className="vfps-reviews-cardhead">
          <h2 className="vfps-reviews-cardtitle">Reviews &amp; Ratings</h2>
        </div>
        <p className="vfps-muted">No reviews yet.</p>
      </section>
    </div>
  );
}
