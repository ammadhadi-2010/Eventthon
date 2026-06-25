import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  archiveAdminProject,
  fetchAdminProjectStats,
  fetchAdminProjects,
  patchAdminProjectStatus,
  updateAdminProject,
} from '../../../../services/adminProjectService';
import { buildStatCards, mapProjectFromApi } from './projectData';

export default function useProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(() => buildStatCards());
  const [timeline, setTimeline] = useState([]);
  const [statusSlices, setStatusSlices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const applyStats = useCallback((payload) => {
    setStats(buildStatCards(payload?.metrics || {}));
    setTimeline(Array.isArray(payload?.timeline) ? payload.timeline : []);
    setStatusSlices(Array.isArray(payload?.statusSlices) ? payload.statusSlices : []);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [rows, statsPayload] = await Promise.all([
        fetchAdminProjects(),
        fetchAdminProjectStats(),
      ]);
      setProjects(rows.map(mapProjectFromApi));
      applyStats(statsPayload);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [applyStats]);

  useEffect(() => {
    reload();
  }, [reload]);

  const recentRows = useMemo(() => projects.slice(0, 8), [projects]);

  const patchProject = useCallback((projectId, patch) => {
    setProjects((prev) =>
      prev.map((row) => (String(row.id) === String(projectId) ? { ...row, ...patch } : row)),
    );
  }, []);

  const refreshStats = useCallback(() => {
    fetchAdminProjectStats().then(applyStats).catch(() => {});
  }, [applyStats]);

  const editProject = useCallback(
    async (projectId, payload) => {
      const data = await updateAdminProject(projectId, payload);
      if (data) patchProject(projectId, mapProjectFromApi(data));
      refreshStats();
      return data;
    },
    [patchProject, refreshStats],
  );

  const changeStatus = useCallback(
    async (projectId, status) => {
      const data = await patchAdminProjectStatus(projectId, status);
      if (data) patchProject(projectId, mapProjectFromApi(data));
      refreshStats();
      return data;
    },
    [patchProject, refreshStats],
  );

  const archiveProject = useCallback(
    async (projectId) => {
      const data = await archiveAdminProject(projectId);
      if (data) patchProject(projectId, mapProjectFromApi(data));
      refreshStats();
      return data;
    },
    [patchProject, refreshStats],
  );

  return {
    projects,
    recentRows,
    stats,
    timeline,
    statusSlices,
    loading,
    error,
    reload,
    editProject,
    changeStatus,
    archiveProject,
  };
}
