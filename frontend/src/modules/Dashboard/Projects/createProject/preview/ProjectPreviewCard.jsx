import React, { useMemo } from 'react';
import { FiCheck } from 'react-icons/fi';
import { NEXT_STEPS, WHY_POINTS } from '../data/createProjectWizardData';
import { useCreateProjectWizard } from '../context/CreateProjectWizardContext';
import ProjectDetailBody from '../../shared/ProjectDetailBody';
import { normalizeProjectView } from '../../utils/projectViewModel';
import '../../styles/project-detail-view.css';

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80';

export default function ProjectPreviewCard({ currentStep }) {
  const { wizardData } = useCreateProjectWizard();
  const view = useMemo(() => normalizeProjectView(wizardData), [wizardData]);

  const attrs = useMemo(
    () => [
      { label: 'Project Status', value: view.status, accent: true },
      { label: 'Project Type', value: view.projectType, accent: true },
      { label: 'Budget Range', value: view.budgetRange },
      { label: 'Timeline', value: view.timeline },
      { label: 'Looking For', value: view.lookingFor },
      { label: 'Experience', value: view.experienceLevel },
      { label: 'Work Mode', value: view.workMode },
    ],
    [view],
  );

  return (
    <aside className="ph-card cp-preview" aria-label="Project preview">
      <h3 className="cp-preview__title">Project Preview</h3>
      <div className="cp-preview__hero">
        <img src={view.coverPreview || DEFAULT_COVER} alt="" className="cp-preview__img" />
        <span className="cp-preview__cam" aria-hidden>
          📷
        </span>
      </div>
      <div className="cp-preview__identity">
        <span className="cp-preview__avatar" aria-hidden>
          🤖
        </span>
        <div>
          <strong>{view.title}</strong>
          <p>{view.shortDescription}</p>
        </div>
      </div>

      <ProjectDetailBody view={view} compact />

      <dl className="cp-preview__attrs">
        {attrs.map((row) => (
          <div key={row.label} className="cp-preview__attr">
            <dt>{row.label}</dt>
            <dd className={row.accent ? 'is-accent' : ''}>{row.value || '—'}</dd>
          </div>
        ))}
        <div className="cp-preview__attr cp-preview__attr--user">
          <dt>Posted By</dt>
          <dd>
            <span className="cp-preview__user-av" aria-hidden>
              {view.postedBy.charAt(0)}
            </span>
            <span>
              {view.postedBy}
              {view.verified ? (
                <span className="cp-preview__verified" title="Verified">
                  <FiCheck size={10} strokeWidth={3} aria-hidden />
                </span>
              ) : null}
              <small>{view.postedRole}</small>
            </span>
          </dd>
        </div>
      </dl>

      <section className="cp-preview__block">
        <h4>Why This Project?</h4>
        <ul>
          {WHY_POINTS.map((point) => (
            <li key={point}>
              <FiCheck size={14} aria-hidden />
              {point}
            </li>
          ))}
        </ul>
      </section>
      <section className="cp-preview__block">
        <h4>Next Steps</h4>
        <ol>
          {NEXT_STEPS.map((item, idx) => (
            <li key={item} className={idx + 1 <= currentStep ? 'is-done' : ''}>
              <span className="cp-preview__step-num">{idx + 1}</span>
              {item}
            </li>
          ))}
        </ol>
      </section>
    </aside>
  );
}
