import React from 'react';
import { FiAward, FiStar, FiTrendingUp, FiZap } from 'react-icons/fi';
import { ACHIEVEMENT_METRICS } from './postWizardMeta';

const METRIC_ICONS = {
  milestone: FiStar,
  personal_best: FiZap,
  certification: FiAward,
  revenue_goal: FiTrendingUp,
};

export default function PostModalContextFields({
  activeType,
  projectProgress = 0,
  onProjectProgressChange,
  achievementMetric = 'milestone',
  onAchievementMetricChange,
  disabled = false,
}) {
  if (activeType === 'PROJECT') {
    return (
      <div className="post-modal__context post-modal__context--project">
        <label className="post-modal__context-label" htmlFor="project-progress-range">
          Project progress
        </label>
        <div className="post-modal__progress-row">
          <input
            id="project-progress-range"
            type="range"
            min="0"
            max="100"
            value={projectProgress}
            disabled={disabled}
            onChange={(e) => onProjectProgressChange(Number(e.target.value))}
          />
          <strong>{projectProgress}%</strong>
        </div>
      </div>
    );
  }

  if (activeType === 'WIN') {
    return (
      <div className="post-modal__context post-modal__context--win">
        <span className="post-modal__context-label">Achievement metric</span>
        <div className="post-modal__metric-row">
          {ACHIEVEMENT_METRICS.map((metric) => {
            const Icon = METRIC_ICONS[metric.key] || FiAward;
            const active = achievementMetric === metric.key;
            return (
              <button
                key={metric.key}
                type="button"
                className={`post-modal__metric-chip${active ? ' is-active' : ''}`}
                disabled={disabled}
                onClick={() => onAchievementMetricChange(metric.key)}
              >
                <Icon size={14} />
                {metric.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
