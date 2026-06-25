import React from 'react';
import ProjectsHubInsightsPanels from './ProjectsHubInsightsPanels';

export default function ProjectsRightSidebar({ activity }) {
  return (
    <aside className="ph-right-stack" aria-label="Project insights">
      <ProjectsHubInsightsPanels activity={activity} />
    </aside>
  );
}
