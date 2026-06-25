import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FEATURED_PROJECTS } from '../data/projectsHubData';
import { fetchProjectDetail, fetchProjectsHub } from '../services/projectsApi';
import { getProjectsUserId } from '../services/projectsUser';
import { findProjectDetailFallback } from '../utils/projectDetailFallback';
import { normalizeProjectView } from '../utils/projectViewModel';

function normalizeListRow(row) {
  const title = row.title || row.name || 'Project';
  return {
    id: row.id,
    title,
    agency: row.agency || 'Studio',
    category: row.category || 'Featured',
    progress: row.progress ?? 0,
    budget: row.budget || '—',
    tone: row.tone || row.icon_tone || 'web',
    badges: row.badges || [],
  };
}

function normalizeDetail(data) {
  if (!data) return null;
  const view = normalizeProjectView(data);
  return {
    ...data,
    ...view,
    id: data.id,
    name: view.title,
    description: view.shortDescription,
    budget: view.budgetRange || data.budget || '—',
    deadline: view.timeline,
    status_label: view.status,
    pricingTiers: view.pricingTiers,
    packageFeatures: view.pricingTiers?.standard?.features || [],
    contributors: data.contributors || [],
  };
}

export default function useProjectExplorerBrowse() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const userId = useMemo(() => getProjectsUserId(), []);
  const [rows, setRows] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listSearchDraft, setListSearchDraft] = useState('');

  const loadList = useCallback(async () => {
    try {
      if (userId) {
        const hub = await fetchProjectsHub(userId);
        const list = hub?.featured?.length ? hub.featured : FEATURED_PROJECTS;
        setRows(list.map(normalizeListRow));
        return;
      }
    } catch {
      /* fallback */
    }
    setRows(FEATURED_PROJECTS.map(normalizeListRow));
  }, [userId]);

  const loadDetail = useCallback(
    async (id) => {
      if (!id) {
        setSelectedProject(null);
        return;
      }
      try {
        const data = await fetchProjectDetail(id, userId);
        if (data) {
          setSelectedProject(normalizeDetail(data));
          return;
        }
      } catch {
        /* fallback */
      }
      setSelectedProject(normalizeDetail(findProjectDetailFallback(id)));
    },
    [userId],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadList();
      if (!cancelled) await loadDetail(projectId);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, loadList, loadDetail]);

  const selectProjectRow = useCallback(
    (id) => {
      if (id) navigate(`/projects/${id}`);
    },
    [navigate],
  );

  const filteredRows = useMemo(() => {
    const q = listSearchDraft.trim().toLowerCase();
    let list = rows;
    if (q) {
      list = rows.filter(
        (row) =>
          row.title.toLowerCase().includes(q) ||
          row.agency.toLowerCase().includes(q) ||
          row.category.toLowerCase().includes(q),
      );
    }
    if (selectedProject && !list.some((row) => row.id === selectedProject.id)) {
      return [normalizeListRow(selectedProject), ...list];
    }
    return list;
  }, [rows, listSearchDraft, selectedProject]);

  const runExplorerSearch = useCallback(() => {
    setListSearchDraft((prev) => prev.trim());
  }, []);

  const patchSelectedProject = useCallback((updated) => {
    if (!updated?.id) return;
    setSelectedProject((prev) => (prev?.id === updated.id ? normalizeDetail({ ...prev, ...updated }) : prev));
  }, []);

  return {
    rows: filteredRows,
    allRows: rows,
    selectedProject,
    loading,
    listSearchDraft,
    setListSearchDraft,
    selectProjectRow,
    runExplorerSearch,
    patchSelectedProject,
  };
}
