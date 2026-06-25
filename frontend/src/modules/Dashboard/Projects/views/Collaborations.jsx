import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ProjectsViewHeader from '../components/shared/ProjectsViewHeader';
import CollaborationsTable from '../components/collaborations/CollaborationsTable';
import { filterCollaborationsByTab } from '../components/collaborations/collaborationsTabs';
import { useProjectsHub } from '../context/ProjectsHubContext';
import { fetchCollaborations } from '../services/projectsApi';
import { COLLABORATIONS_TABLE_ROWS } from '../data/projectsViewsData';

export default function Collaborations() {
  const { userId, onOpenProject } = useProjectsHub();
  const [activeTab, setActiveTab] = useState('all');
  const [rows, setRows] = useState(COLLABORATIONS_TABLE_ROWS);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await fetchCollaborations(userId);
      if (data.rows?.length) setRows(data.rows);
    } catch {
      setRows(COLLABORATIONS_TABLE_ROWS);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () => filterCollaborationsByTab(rows, activeTab),
    [rows, activeTab],
  );

  return (
    <div className="ph-center-stack ph-collaborations">
      <ProjectsViewHeader
        title="Collaborations"
        subtitle="Projects and tasks you are collaborating on with others."
      />
      <CollaborationsTable
        rows={filtered}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onFilter={() => window.alert('Collaboration filters coming soon.')}
        onOpenProject={onOpenProject}
      />
    </div>
  );
}
