import React from 'react';
import { FiCheck } from 'react-icons/fi';

function TeamAvatars({ team = [] }) {
  return (
    <div className="ph-pcard-team" aria-hidden>
      {team.slice(0, 4).map((seed, i) => (
        <img
          key={seed}
          src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(seed)}`}
          alt=""
          className="ph-pcard-team-av"
          style={{ zIndex: 10 - i }}
        />
      ))}
    </div>
  );
}

export default function ProjectCard({ project, onOpen }) {
  const {
    title,
    description,
    agency,
    verified,
    badges = [],
    progress,
    budget,
    tasks,
    team,
    tone,
  } = project;

  return (
    <article
      className={`ph-pcard ph-pcard--${tone}`}
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(project)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen?.(project);
        }
      }}
    >
      <div className="ph-pcard-banner" aria-hidden />
      <div className="ph-pcard-badges">
        {badges.map((b) => (
          <span key={b} className="ph-pcard-badge">
            {b}
          </span>
        ))}
      </div>
      <h3 className="ph-pcard-title">{title}</h3>
      <p className="ph-pcard-desc">{description}</p>
      <p className="ph-pcard-agency">
        {agency}
        {verified ? (
          <span className="ph-pcard-verified" title="Verified agency">
            <FiCheck size={11} strokeWidth={3} aria-hidden />
          </span>
        ) : null}
      </p>
      <div className="ph-pcard-progress">
        <div className="ph-pcard-progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>
        <span className="ph-pcard-progress-pct">{progress}%</span>
      </div>
      <div className="ph-pcard-meta">
        <span>{budget}</span>
        <span>{tasks} tasks</span>
      </div>
      <TeamAvatars team={team} />
    </article>
  );
}
