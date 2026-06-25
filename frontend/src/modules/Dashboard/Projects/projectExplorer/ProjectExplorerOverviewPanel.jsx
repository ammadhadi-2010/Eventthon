import React, { useMemo } from 'react';
import { FiCheck } from 'react-icons/fi';
import ProjectDetailBody from '../shared/ProjectDetailBody';
import { normalizeProjectView } from '../utils/projectViewModel';
import { TONE_GRADIENTS } from './constants';
import '../styles/project-detail-view.css';

export default function ProjectExplorerOverviewPanel({ project }) {
  const view = useMemo(() => normalizeProjectView(project), [project]);
  const tone = view.tone || 'web';
  const gradient = TONE_GRADIENTS[tone] || TONE_GRADIENTS.web;
  const label = (view.category || 'PROJECT').toUpperCase();

  return (
    <>
      <div className="gigx-hero-media">
        {view.coverPreview?.startsWith('http') ? (
          <img src={view.coverPreview} alt={view.title} />
        ) : (
          <div className="gigx-media-placeholder" style={{ background: gradient }}>
            {label}
          </div>
        )}
      </div>

      <div className="gigx-about-card pdv-glass-block">
        <h3>About This Project</h3>
        <ProjectDetailBody view={view} compact hideTemplateRow />
        {view.objectives ? (
          <ul className="pdv-objectives">
            <li>
              <FiCheck size={12} aria-hidden />
              {view.objectives}
            </li>
            {view.deliverables ? (
              <li>
                <FiCheck size={12} aria-hidden />
                {view.deliverables}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </>
  );
}
