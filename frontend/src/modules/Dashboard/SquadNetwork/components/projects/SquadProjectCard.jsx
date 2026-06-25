import React from 'react';
import { ExternalLink, Eye, GitBranch, MoreHorizontal } from 'lucide-react';
import ProjectContributorAvatars from '../../../Projects/components/ProjectContributorAvatars';
import { normalizeSquadProjectCard, techBadgeTone } from './squadProjectCardModel';
import '../../styles/squad-project-card.css';

const STATUS_CLASS = {
  'in progress': 'sq-proj-card__status--progress',
  completed: 'sq-proj-card__status--completed',
  'on hold': 'sq-proj-card__status--hold',
  planning: 'sq-proj-card__status--planning',
};

export default function SquadProjectCard({
  project,
  index = 0,
  isMenuOpen,
  onMenuToggle,
  onView,
  onEdit,
  onDelete,
  onMarkCompleted,
  onMarkHold,
}) {
  const model = normalizeSquadProjectCard(project, index);
  const statusClass = STATUS_CLASS[model.statusKey] || STATUS_CLASS['in progress'];

  const openView = () => onView?.(model.raw);

  const openExternal = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      className="sq-proj-card sq-proj-card--clickable"
      onClick={openView}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openView();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="sq-proj-card__top">
        <div className="sq-proj-card__title-row">
          <h3 className="sq-proj-card__title">{model.title}</h3>
          <span className={`sq-proj-card__status ${statusClass}`}>{model.statusLabel}</span>
        </div>

        <div className="sq-proj-card__actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="sq-proj-card__icon-btn"
            title="Live link"
            disabled={!model.liveUrl}
            onClick={() => openExternal(model.liveUrl)}
          >
            <ExternalLink size={15} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="sq-proj-card__icon-btn"
            title="GitHub repository"
            disabled={!model.githubUrl}
            onClick={() => openExternal(model.githubUrl)}
          >
            <GitBranch size={15} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="sq-proj-card__icon-btn"
            title="View full project overview"
            onClick={openView}
          >
            <Eye size={15} strokeWidth={2} />
          </button>
          <div className="sq-proj-card__menu-wrap">
            <button
              type="button"
              className="sq-proj-card__icon-btn"
              title="More actions"
              onClick={() => onMenuToggle?.(model.id)}
            >
              <MoreHorizontal size={15} strokeWidth={2} />
            </button>
            {isMenuOpen ? (
              <div className="sq-proj-card__menu">
                <button type="button" className="sq-proj-card__menu-item" onClick={() => onEdit?.(model.raw)}>
                  Edit project
                </button>
                <button type="button" className="sq-proj-card__menu-item" onClick={() => onMarkCompleted?.(model.raw)}>
                  Mark completed
                </button>
                <button type="button" className="sq-proj-card__menu-item" onClick={() => onMarkHold?.(model.raw)}>
                  Mark on hold
                </button>
                <button
                  type="button"
                  className="sq-proj-card__menu-item sq-proj-card__menu-item--danger"
                  onClick={() => onDelete?.(model.id)}
                >
                  Delete
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="sq-proj-card__stack">
        {model.techStack.map((tech) => (
          <span
            key={tech}
            className="sq-proj-card__tech"
            style={{ color: techBadgeTone(tech) }}
          >
            {tech}
          </span>
        ))}
      </div>

      <p className="sq-proj-card__info-line">{model.budgetTimelineLine}</p>

      <div className="sq-proj-card__metrics sq-proj-card__metrics--base">
        <div className="sq-proj-card__metric">
          <span className="sq-proj-card__metric-label">Tasks</span>
          <span className="sq-proj-card__metric-value">
            {model.tasksCompleted}/{model.tasksTotal}
          </span>
        </div>
        <div className="sq-proj-card__metric">
          <span className="sq-proj-card__metric-label">Contributors</span>
          <span className="sq-proj-card__metric-value">{model.contributors}</span>
        </div>
      </div>

      <div className="sq-proj-card__footer">
        <div className="sq-proj-card__progress-track">
          <div className="sq-proj-card__progress-fill" style={{ width: `${model.progress}%` }} />
        </div>
        <span className="sq-proj-card__progress-label">{model.progress}% complete</span>
        <ProjectContributorAvatars contributors={model.contributorList} />
      </div>
    </article>
  );
}
