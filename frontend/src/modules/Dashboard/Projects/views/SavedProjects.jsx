import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ProjectsViewHeader from '../components/shared/ProjectsViewHeader';
import ExploreToolbar from '../components/explore/ExploreToolbar';
import SavedProjectsTable from '../components/saved/SavedProjectsTable';
import { useProjectsHub } from '../context/ProjectsHubContext';
import { buildSavedProjectMenuItems } from '../hooks/projectRowMenuItems';
import { fetchSavedProjects } from '../services/projectsApi';
import { mapSavedRow } from '../utils/mapProjectRows';
import { SAVED_PROJECTS_ROWS } from '../data/savedProjectsData';

export default function SavedProjects() {
  const { userId, removeSaved, onOpenProject } = useProjectsHub();
  const [query, setQuery] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setRows(SAVED_PROJECTS_ROWS);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchSavedProjects(userId);
      setRows((data.rows || []).map(mapSavedRow));
    } catch {
      setRows(SAVED_PROJECTS_ROWS);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.ownerName.toLowerCase().includes(q),
    );
  }, [query, rows]);

  const handleUnsave = async (row) => {
    try {
      if (userId) await removeSaved(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch {
      window.alert('Could not remove saved project.');
    }
  };

  const handleShare = (row) => {
    const text = `${row.title} — saved on EventThon Projects`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      window.alert('Link copied to clipboard.');
    } else {
      window.alert(text);
    }
  };

  const buildMenu = (row) =>
    buildSavedProjectMenuItems({
      row,
      onView: onOpenProject,
      onShare: handleShare,
      onUnsave: handleUnsave,
    });

  return (
    <div className="ph-center-stack ph-saved">
      <ProjectsViewHeader title="Saved Projects" subtitle="Your saved projects and ideas." />
      <ExploreToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search saved projects..."
        searchLabel="Search saved projects"
        onFilter={() => window.alert('Saved project filters coming soon.')}
      />
      {loading ? <p className="ph-table-empty">Loading saved projects…</p> : null}
      <SavedProjectsTable
        rows={filtered}
        onUnsave={handleUnsave}
        buildMenuItems={buildMenu}
      />
    </div>
  );
}
