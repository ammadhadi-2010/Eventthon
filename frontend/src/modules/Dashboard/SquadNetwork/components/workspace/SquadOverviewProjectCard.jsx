import React from 'react';
import '../../styles/squad-project-card.css';
import ProjectContributorAvatars from '../../../Projects/components/ProjectContributorAvatars';
import {
  formatBudgetSegment,
  formatTimelineSegment,
  normalizeSquadProjectCard,
  techBadgeTone,
} from '../projects/squadProjectCardModel';

const STATUS_CLASS = {
  'in progress': 'sq-proj-card__status--progress',
  completed: 'sq-proj-card__status--completed',
  'on hold': 'sq-proj-card__status--hold',
  planning: 'sq-proj-card__status--planning',
};

export default function SquadOverviewProjectCard({ project }) {
  const model = normalizeSquadProjectCard(project);
  const statusClass = STATUS_CLASS[model.statusKey] || STATUS_CLASS['in progress'];
  const budget = formatBudgetSegment(project);
  const timeline = formatTimelineSegment(project);

  return (
    <article className="sq-ws-mini-project">
      <div className="sq-ws-mini-project__head">
        <strong className="sq-ws-mini-project__title">{model.title}</strong>
        <span className={`sq-proj-card__status ${statusClass}`}>{model.statusLabel}</span>
      </div>

      <p className="sq-ws-mini-project__meta">
        <span>Budget: {budget} USD</span>
        <span className="sq-ws-mini-project__sep">|</span>
        <span>Timeline: {timeline}</span>
      </p>

      <div className="sq-ws-mini-project__tech">
        {model.techStack.slice(0, 6).map((tech) => (
          <span
            key={tech}
            className="sq-ws-mini-project__tech-badge"
            style={{ color: techBadgeTone(tech) }}
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="sq-ws-mini-project__tasks">
        <div className="sq-ws-mini-project__tasks-label">
          <span>Tasks</span>
          <strong>
            {model.tasksCompleted}/{model.tasksTotal}
          </strong>
        </div>
        <div className="sq-ws-progress sq-ws-mini-project__bar">
          <span style={{ width: `${model.progress}%` }} />
        </div>
        <span className="sq-ws-mini-project__pct">{model.progress}%</span>
        <ProjectContributorAvatars contributors={model.contributorList} max={3} />
      </div>
    </article>
  );
}
