import React from 'react';
import { FiCheck } from 'react-icons/fi';
import RichHtmlContent from './RichHtmlContent';
import ProjectTemplateBadges from './ProjectTemplateBadges';
import '../styles/project-detail-view.css';

export default function ProjectDetailBody({ view, compact = false, hideTemplateRow = false }) {
  if (!view) return null;

  return (
    <div className={`pdv-body${compact ? ' pdv-body--compact' : ''}`}>
      {!hideTemplateRow ? (
        <ProjectTemplateBadges
          category={view.category}
          subCategory={view.subCategory}
          templateName={view.templateName}
          templateUses={view.templateUses}
        />
      ) : null}

      {view.shortDescription ? (
        <p className="pdv-lead">{view.shortDescription}</p>
      ) : null}

      <section className="pdv-glass-block">
        <h4 className="pdv-block-title">Detailed description</h4>
        <RichHtmlContent html={view.detailedDescriptionHtml} />
      </section>

      {view.techStack?.length ? (
        <section className="pdv-glass-block">
          <h4 className="pdv-block-title">Technology stack</h4>
          <div className="pdv-tech-row">
            {view.techStack.map((tech) => (
              <span key={tech} className="pdv-tech-badge">
                {tech}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {view.milestones?.length ? (
        <section className="pdv-glass-block">
          <h4 className="pdv-block-title">Milestones</h4>
          <ul className="pdv-milestones">
            {view.milestones.map((step) => (
              <li key={step}>
                <FiCheck size={14} aria-hidden />
                {step}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {view.tags?.length ? (
        <div className="pdv-tags">
          {view.tags.map((tag) => (
            <span key={tag} className="pdv-tag">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
