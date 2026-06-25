/**
 * Route wire-up (ProjectsRoutes.js):
 *   <Route path="all" element={<AllProjectsView />} />
 * Full path: /projects/all
 * Component: <AllProjectsView />
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useScrollDirection } from '../../../../hooks/useScrollDirection';
import { FEATURED_PROJECTS } from '../data/projectsHubData';
import { fetchProjectsHub } from '../services/projectsApi';
import { getProjectsUserId } from '../services/projectsUser';
import ProjectCard from './ProjectCard';
import HubMobileTopBar from '../../components/mobile/HubMobileTopBar';
import { HUB_MOBILE_SEARCH } from '../../components/mobile/hubMobileSearchPresets';
import '../styles/projects-hub.css';
import '../styles/projects-hub-mobile.css';
import '../styles/all-projects-view.css';

function normalizeFeaturedProject(row) {
  return {
    id: row.id,
    title: row.title || row.name || 'Project',
    description: row.description || row.short_description || '',
    agency: row.agency || 'Studio',
    verified: row.verified ?? true,
    badges: row.badges?.length ? row.badges : ['FEATURED'],
    progress: row.progress ?? 0,
    budget: row.budget || '—',
    tasks: row.tasks ?? 0,
    team: row.team || [],
    tone: row.tone || row.icon_tone || 'web',
  };
}

export default function AllProjectsView() {
  const navigate = useNavigate();
  const scrollDirection = useScrollDirection();
  const userId = useMemo(() => getProjectsUserId(), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState(() => FEATURED_PROJECTS.map(normalizeFeaturedProject));
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState('');

  const loadProjects = useCallback(async () => {
    if (!userId) {
      setProjects(FEATURED_PROJECTS.map(normalizeFeaturedProject));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const hub = await fetchProjectsHub(userId);
      const list = hub?.featured?.length ? hub.featured : FEATURED_PROJECTS;
      setProjects(list.map(normalizeFeaturedProject));
    } catch {
      setError('Could not load projects from server. Showing offline data.');
      setProjects(FEATURED_PROJECTS.map(normalizeFeaturedProject));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => {
      const hay = `${p.title} ${p.description} ${p.agency}`.toLowerCase();
      return hay.includes(q);
    });
  }, [projects, searchQuery]);

  const onOpenProject = useCallback(
    (project) => {
      if (project?.id) navigate(`/projects/${project.id}`);
    },
    [navigate],
  );

  return (
    <div className="ph-all-page ph-mobile-shell">
      <HubMobileTopBar
        scrollDirection={scrollDirection}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchMode="instant"
        {...HUB_MOBILE_SEARCH.projects}
      />

      <div className="ph-all-page__body ph-mobile-shell__body">
        <header className="ph-all-page__head">
          <div className="ph-all-page__title-row">
            <button
              type="button"
              className="ph-all-page__back"
              onClick={() => navigate('/projects')}
              aria-label="Back to projects hub"
            >
              <FiArrowLeft size={20} aria-hidden />
            </button>
            <div className="ph-all-page__title-copy">
              <h1 className="ph-all-page__title">Projects</h1>
              <p className="ph-all-page__sub">
                Browse featured projects from your hub with live progress and budget tracking.
              </p>
            </div>
          </div>
        </header>

        {loading ? <p className="ph-all-page__status">Loading projects…</p> : null}
        {error ? <p className="ph-all-page__banner">{error}</p> : null}

        {!loading && filtered.length === 0 ? (
          <p className="ph-all-page__empty">No projects match your search.</p>
        ) : (
          <div className="ph-all-projects-grid" role="list">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} onOpen={onOpenProject} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
