import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ProjectsViewHeader from '../components/shared/ProjectsViewHeader';
import MilestonesProjectFilter from '../components/milestones/MilestonesProjectFilter';
import MilestonesTable from '../components/milestones/MilestonesTable';
import { useProjectsHub } from '../context/ProjectsHubContext';
import { fetchMilestones } from '../services/projectsApi';
import { normalizeMilestoneRow } from '../components/milestones/milestoneRowMap';
import { MILESTONE_PROJECT_OPTIONS, MILESTONES_ROWS } from '../data/milestonesData';

export default function Milestones() {
  const { userId } = useProjectsHub();
  const [projectFilter, setProjectFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [options, setOptions] = useState(MILESTONE_PROJECT_OPTIONS);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await fetchMilestones(userId);
      const apiRows = Array.isArray(data?.rows) ? data.rows.map(normalizeMilestoneRow) : [];
      const apiOptions = Array.isArray(data?.project_options) ? data.project_options : [];
      setRows(apiRows.length ? apiRows : MILESTONES_ROWS);
      setOptions(apiOptions.length ? [{ id: 'all', label: 'All Projects' }, ...apiOptions] : MILESTONE_PROJECT_OPTIONS);
    } catch {
      setRows(MILESTONES_ROWS);
      setOptions(MILESTONE_PROJECT_OPTIONS);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (projectFilter === 'all') return rows;
    return rows.filter((r) => r.projectId === projectFilter);
  }, [projectFilter, rows]);

  return (
    <div className="ph-center-stack ph-milestones">
      <div className="ph-ms-head">
        <ProjectsViewHeader
          title="Milestones"
          subtitle="Track and manage project milestones."
        />
        <MilestonesProjectFilter
          value={projectFilter}
          options={options}
          onChange={setProjectFilter}
        />
      </div>
      <MilestonesTable rows={filtered} />
    </div>
  );
}
