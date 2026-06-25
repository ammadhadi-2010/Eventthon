import React from 'react';
import { Box, Gauge, Rocket, Sparkles, Users } from 'lucide-react';
import { HIGHLIGHT_GLOWS } from '../../../utils/showroomBrandIcons';

const HIGHLIGHT_ICONS = [Box, Sparkles, Gauge, Users, Rocket];

function milestoneBadge(milestone) {
  return milestone.statusLabel || milestone.description || milestone.title || 'Scheduled';
}

export default function ProjectShowroomHighlights({
  highlights = [],
  milestones = [],
  progress = 75,
  milestonesBelow = true,
}) {
  const items = highlights.length
    ? highlights
    : [
        { title: 'Modern Stack', subtitle: 'Production-ready architecture' },
        { title: 'Live Analytics', subtitle: 'Real-time insights' },
      ];

  const milestoneBlock = (
    <section className="ps-milestones" aria-label="Project milestones">
      <header className="ps-section-head">
        <h2>Project Milestones</h2>
        <span>{progress}% complete</span>
      </header>
      <div className="ps-progress-track">
        <div className="ps-progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <ul className="ps-milestone-list">
        {milestones.map((milestone) => (
          <li
            key={milestone.title}
            className={`ps-milestone ps-milestone--${milestone.status || 'pending'}`}
          >
            <span>{milestone.title}</span>
            <span className="ps-milestone-badge">{milestoneBadge(milestone)}</span>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <>
      <section className="ps-highlights" aria-label="Project highlights">
        <h2>Project Highlights</h2>
        <div className="ps-highlight-grid">
          {items.map((item, idx) => {
            const Icon = HIGHLIGHT_ICONS[idx % HIGHLIGHT_ICONS.length];
            const glow = HIGHLIGHT_GLOWS[idx % HIGHLIGHT_GLOWS.length];
            return (
              <article
                key={item.title}
                className={`ps-highlight-card ps-highlight-card--${glow.tone}`}
                style={{ '--hl-glow': glow.gradient }}
              >
                <span className="ps-highlight-icon" aria-hidden>
                  <Icon size={22} strokeWidth={1.75} />
                </span>
                <strong>{item.title}</strong>
                <p>{item.subtitle}</p>
              </article>
            );
          })}
        </div>
      </section>
      {milestonesBelow ? milestoneBlock : null}
    </>
  );
}
