import React, { useMemo, useState } from 'react';
import ProjectsViewHeader from '../components/shared/ProjectsViewHeader';
import MyProjectsTable from '../components/myProjects/MyProjectsTable';
import { filterMyProjectsByTab } from '../components/myProjects/myProjectsTabs';
import { useProjectsHub } from '../context/ProjectsHubContext';
import { mapHubTableRow } from '../utils/mapProjectRows';

export default function MyProjects() {
  const { tableRows, handleProjectAction, onOpenProject } = useProjectsHub();
  const [activeTab, setActiveTab] = useState('all');

  const mapped = useMemo(() => tableRows.map(mapHubTableRow), [tableRows]);
  const rows = useMemo(() => filterMyProjectsByTab(mapped, activeTab), [mapped, activeTab]);

  const tabCounts = useMemo(() => {
    const all = mapped.length;
    const inProg = mapped.filter((r) => r.status === 'in-progress' || r.status === 'in-review').length;
    const done = mapped.filter((r) => r.status === 'completed').length;
    const hold = mapped.filter((r) => r.status === 'on-hold').length;
    return { all, 'in-progress': inProg, completed: done, 'on-hold': hold };
  }, [mapped]);

  return (
    <div className="ph-center-stack ph-my-projects">
      <ProjectsViewHeader
        title="My Projects"
        subtitle="Manage and track all your projects in one place."
      />
      <MyProjectsTable
        rows={rows}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabCounts={tabCounts}
        onFilter={() => window.alert('Advanced filters coming soon.')}
        onOpenProject={onOpenProject}
        onProjectAction={handleProjectAction}
      />
    </div>
  );
}
