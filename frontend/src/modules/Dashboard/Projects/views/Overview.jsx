import React from 'react';
import ProjectsHubHeader from '../components/ProjectsHubHeader';
import ProjectsKpiTiles from '../components/ProjectsKpiTiles';
import ProjectsFeaturedSection from '../components/ProjectsFeaturedSection';
import ProjectsTable from '../components/ProjectsTable';
import ProjectsHubInsightsPanels from '../components/ProjectsHubInsightsPanels';

export default function Overview({
  searchQuery,
  onSearchChange,
  onViewAnalytics,
  tableTab,
  onTabChange,
  filteredRows,
  tableTabs,
  kpis,
  featured,
  budgetSummary,
  onOpenProject,
  onProjectAction,
  activeMenu,
  onMenuSelect,
  onNewProject,
  menuCounts,
  activity,
}) {
  return (
    <div className="ph-center-stack">
      <ProjectsHubHeader
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onViewAnalytics={onViewAnalytics}
        activeMenu={activeMenu}
        onMenuSelect={onMenuSelect}
        onNewProject={onNewProject}
        menuCounts={menuCounts}
      />
      <ProjectsKpiTiles kpis={kpis} budgetSummary={budgetSummary} />
      <ProjectsFeaturedSection projects={featured} onOpenProject={onOpenProject} />
      <ProjectsTable
        rows={filteredRows}
        tableTab={tableTab}
        onTabChange={onTabChange}
        tableTabs={tableTabs}
        onOpenProject={onOpenProject}
        onProjectAction={onProjectAction}
      />
      <div className="ph-mobile-insights" aria-label="Project insights">
        <ProjectsHubInsightsPanels activity={activity} activityLimit={3} />
      </div>
    </div>
  );
}
