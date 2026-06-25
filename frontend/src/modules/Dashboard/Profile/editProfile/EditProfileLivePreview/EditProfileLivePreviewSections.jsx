import React, { useMemo } from 'react';
import { FiBookOpen, FiCheck, FiGlobe } from 'react-icons/fi';
import { educationYears, resolvePreviewMedia } from './livePreviewUtils';
import '../editProfileLayout.css';

const wrapSection = (stepId, focusStepId, extraClass) =>
  `ep-live-preview__sync-target ep-live-preview__block ep-live-preview__section ${extraClass} ${focusStepId === stepId ? 'ep-live-preview__sync-target--active' : ''}`;

/**
 * Main column: full stacked preview — updates live from draft; scroll target ids match wizard steps.
 */
const EditProfileLivePreviewSections = ({
  rawBio,
  bioIsRich,
  aboutPlainFallback,
  skillTags,
  subSkillTags,
  skillEntries = [],
  languageTags = [],
  educationList = [],
  primaryNiche,
  subNiche,
  experiencePreviewList,
  projectsPreviewList,
  focusStepId = 'basic',
}) => {
  const sortedProjects = useMemo(() => {
    const list = [...projectsPreviewList];
    list.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    return list;
  }, [projectsPreviewList]);

  const featuredThree = sortedProjects.slice(0, 3);
  const restProjects = sortedProjects.slice(3);

  return (
    <>
      <div
        id="ep-preview-section-about"
        data-ep-preview-step="about"
        className={wrapSection('about', focusStepId, 'ep-live-preview__block--about ep-live-preview__section--about-detail')}
      >
        <h4 className="ep-live-preview__section-title">About you</h4>
        {rawBio ? (
          bioIsRich ? (
            <div className="ep-live-preview__bio-rich" dangerouslySetInnerHTML={{ __html: rawBio }} />
          ) : (
            <p className="ep-live-preview__about ep-live-preview__about--detail">{aboutPlainFallback}</p>
          )
        ) : (
          <p className="ep-live-preview__about ep-live-preview__empty-hint">{aboutPlainFallback}</p>
        )}

        <div className="ep-live-preview__about-follow">
          <h4 className="ep-live-preview__section-title ep-live-preview__section-title--sub">Top skills</h4>
          {skillEntries.length > 0 ? (
            <div className="ep-live-preview__skill-bars ep-live-preview__skill-bars--compact">
              {skillEntries.slice(0, 5).map((e) => {
                const pct = Math.min(100, Math.max(5, Number(e.proficiency) || 80));
                return (
                  <div key={e.id || e.name} className="ep-live-preview__skill-bar">
                    <div className="ep-live-preview__skill-bar-top">
                      <span className="ep-live-preview__skill-bar-name">{e.name}</span>
                      <span className="ep-live-preview__skill-bar-pct">{pct}%</span>
                    </div>
                    <div className="ep-live-preview__skill-bar-track">
                      <div className="ep-live-preview__skill-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : skillTags.length > 0 ? (
            <div className="ep-live-preview__tags ep-live-preview__tags--scroll">
              {skillTags.map((s) => (
                <span key={s} className="ep-live-preview__tag">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="ep-live-preview__empty-hint ep-live-preview__empty-hint--tight">Add skills in the Skills &amp; Niche step.</p>
          )}

          <h4 className="ep-live-preview__section-title ep-live-preview__section-title--sub">Languages</h4>
          {languageTags.length > 0 ? (
            <div className="ep-live-preview__lang-row ep-live-preview__lang-row--compact">
              <FiGlobe className="ep-live-preview__lang-globe" aria-hidden />
              <div className="ep-live-preview__tags ep-live-preview__tags--scroll">
                {languageTags.map((s) => (
                  <span key={s} className="ep-live-preview__tag">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="ep-live-preview__empty-hint ep-live-preview__empty-hint--tight">Add languages in the About step.</p>
          )}

          <h4 className="ep-live-preview__section-title ep-live-preview__section-title--sub">Education</h4>
          {educationList.length > 0 ? (
            <ul className="ep-live-preview__edu-list ep-live-preview__edu-list--compact">
              {educationList.map((e) => {
                const y = educationYears(e);
                return (
                  <li key={e.id || `${e.degree}-${e.institution}`} className="ep-live-preview__edu-item">
                    <FiBookOpen className="ep-live-preview__edu-icon" aria-hidden />
                    <div className="ep-live-preview__edu-body">
                      <p className="ep-live-preview__edu-degree">{e.degree?.trim() || 'Degree'}</p>
                      <p className="ep-live-preview__edu-inst">{e.institution?.trim() || 'Institution'}</p>
                    </div>
                    {y ? <span className="ep-live-preview__edu-years">{y}</span> : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="ep-live-preview__empty-hint ep-live-preview__empty-hint--tight">Add education in the About step.</p>
          )}
        </div>
      </div>

      <div
        id="ep-preview-section-experience"
        data-ep-preview-step="experience"
        className={wrapSection('experience', focusStepId, 'ep-live-preview__section--tight ep-live-preview__section--exp')}
      >
        <h4 className="ep-live-preview__section-title">Experience</h4>
        {experiencePreviewList.length > 0 ? (
          <ul className="ep-live-preview__exp-list">
            {experiencePreviewList.map((ex) => {
              const lg = resolvePreviewMedia(ex.logoUrl);
              const cn = String(ex.company || '').trim();
              const rn = String(ex.role || '').trim();
              const init = ((cn && cn[0]) || (rn && rn[0]) || '?').toUpperCase();
              return (
                <li key={ex.id} className="ep-live-preview__exp-row">
                  <div className="ep-live-preview__exp-logo-mini">
                    {lg ? (
                      <img src={lg} alt="" className="ep-live-preview__exp-logo-mini-img" />
                    ) : (
                      <span className="ep-live-preview__exp-logo-letter-only">{init}</span>
                    )}
                  </div>
                  <div className="ep-live-preview__exp-body-mini">
                    <p className="ep-live-preview__exp-role-mini">{ex.role?.trim() || 'Role'}</p>
                    <p className="ep-live-preview__exp-co-mini">{ex.company?.trim() || 'Company'}</p>
                    {ex.period ? <p className="ep-live-preview__exp-period-mini">{ex.period}</p> : null}
                    {ex.tags?.length > 0 ? (
                      <div className="ep-live-preview__tags ep-live-preview__tags--scroll ep-live-preview__tags--compact">
                        {ex.tags.slice(0, 4).map((t) => (
                          <span key={t} className="ep-live-preview__tag">
                            {t}
                          </span>
                        ))}
                        {ex.tags.length > 4 ? (
                          <span className="ep-live-preview__exp-more-mini">+{ex.tags.length - 4}</span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="ep-live-preview__empty-hint">Add roles in the Experience step.</p>
        )}
      </div>

      <div
        id="ep-preview-section-projects"
        data-ep-preview-step="projects"
        className={wrapSection('projects', focusStepId, 'ep-live-preview__section--tight ep-live-preview__section--proj')}
      >
        <div className="ep-live-preview__proj-featured-head">
          <h4 className="ep-live-preview__section-title" style={{ margin: 0 }}>
            Featured projects{featuredThree.length > 0 ? ` (${featuredThree.length})` : ''}
          </h4>
          <button type="button" className="ep-live-preview__proj-view-all" tabIndex={-1}>
            View all
          </button>
        </div>
        {featuredThree.length > 0 ? (
          <ul className="ep-live-preview__proj-featured-grid">
            {featuredThree.map((pj) => {
              const thumb = resolvePreviewMedia(pj.imageUrl);
              const firstKr = (Array.isArray(pj.keyResults) ? pj.keyResults.filter(Boolean) : [])[0];
              return (
                <li key={pj.id} className="ep-live-preview__proj-card-mini">
                  <div className="ep-live-preview__proj-card-mini-thumb">
                    {thumb ? (
                      <img src={thumb} alt="" />
                    ) : (
                      <span>Img</span>
                    )}
                  </div>
                  <div className="ep-live-preview__proj-card-mini-body">
                    <p className="ep-live-preview__proj-card-mini-title">{pj.title?.trim() || 'Untitled'}</p>
                    {firstKr ? <p className="ep-live-preview__proj-card-mini-kr">{firstKr}</p> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="ep-live-preview__empty-hint">Add projects in the Projects step.</p>
        )}

        {restProjects.length > 0 ? (
          <>
            <p className="ep-live-preview__proj-more-row">+{restProjects.length} more on your profile</p>
            <ul className="ep-live-preview__proj-list">
              {restProjects.map((pj) => {
                const thumb = resolvePreviewMedia(pj.imageUrl);
                const kr = Array.isArray(pj.keyResults) ? pj.keyResults.filter(Boolean) : [];
                const firstKr = kr[0];
                return (
                  <li key={pj.id} className="ep-live-preview__proj-row">
                    <div className="ep-live-preview__proj-thumb-mini">
                      {thumb ? (
                        <img src={thumb} alt="" className="ep-live-preview__proj-thumb-mini-img" />
                      ) : (
                        'Img'
                      )}
                    </div>
                    <div className="ep-live-preview__proj-body-mini">
                      <p className="ep-live-preview__proj-title-mini">
                        <span>{pj.title?.trim() || 'Untitled project'}</span>
                        {pj.featured ? <span className="ep-live-preview__proj-featured">Featured</span> : null}
                      </p>
                      {pj.desc?.trim() ? (
                        <p className="ep-live-preview__proj-desc-mini">{pj.desc.trim()}</p>
                      ) : null}
                      {firstKr ? (
                        <p className="ep-live-preview__proj-check-line">
                          <FiCheck className="ep-live-preview__proj-check-icon" strokeWidth={2.75} aria-hidden />
                          <span>{firstKr}</span>
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
      </div>

      <div
        id="ep-preview-section-skills"
        data-ep-preview-step="skills"
        className={wrapSection('skills', focusStepId, 'ep-live-preview__section--tight')}
      >
        <h4 className="ep-live-preview__section-title">Niche &amp; categories</h4>

        <div className="ep-live-preview__niche-row ep-live-preview__niche-row--flush">
          <p className="ep-live-preview__niche-label">Primary niche</p>
          <p className="ep-live-preview__niche-value">{primaryNiche || '—'}</p>
          <p className="ep-live-preview__niche-label">Sub niche</p>
          <p className="ep-live-preview__niche-value">{subNiche || '—'}</p>
        </div>

        {(subSkillTags.length > 0 || (skillTags.length > 0 && skillEntries.length === 0)) && (
          <>
            <h4 className="ep-live-preview__section-title" style={{ marginTop: '1rem' }}>
              Categories · What you do best
            </h4>
            {skillTags.length > 0 && skillEntries.length === 0 ? (
              <div className="ep-live-preview__tags ep-live-preview__tags--scroll">
                {skillTags.map((s) => (
                  <span key={`c-${s}`} className="ep-live-preview__tag">
                    {s}
                  </span>
                ))}
              </div>
            ) : null}
            {subSkillTags.length > 0 ? (
              <div className="ep-live-preview__tags ep-live-preview__tags--sub ep-live-preview__tags--scroll" style={{ marginTop: '0.35rem' }}>
                {subSkillTags.map((s, i) => (
                  <span key={`sub-${i}-${s}`} className="ep-live-preview__tag ep-live-preview__tag--sub">
                    {s}
                  </span>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>

      <div
        id="ep-preview-section-identity"
        data-ep-preview-step="identity"
        className={wrapSection('identity', focusStepId, 'ep-live-preview__section--tight')}
      >
        <h4 className="ep-live-preview__section-title">Identity</h4>
        <p className="ep-live-preview__empty-hint">
          Government ID verification happens in this step. Trust badges on your public profile update after approval.
        </p>
      </div>
    </>
  );
};

export default EditProfileLivePreviewSections;
