import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ProjectsViewHeader from '../components/shared/ProjectsViewHeader';
import ExploreToolbar from '../components/explore/ExploreToolbar';
import ExploreProjectCard from '../components/explore/ExploreProjectCard';
import ExplorePagination from '../components/explore/ExplorePagination';
import { useProjectsHub } from '../context/ProjectsHubContext';
import { fetchExploreProjects, fetchProjectsList } from '../services/projectsApi';
import { EXPLORE_PAGE_SIZE, EXPLORE_PROJECTS } from '../data/exploreProjectsData';

export default function ExploreProjects() {
  const { userId, toggleSaveExplore, onOpenProject } = useProjectsHub();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [projects, setProjects] = useState(EXPLORE_PROJECTS);
  const [total, setTotal] = useState(EXPLORE_PROJECTS.length);

  const load = useCallback(async () => {
    const params = {
      owner_user_id: userId,
      q: query.trim(),
      skip: (page - 1) * EXPLORE_PAGE_SIZE,
      limit: EXPLORE_PAGE_SIZE,
    };
    try {
      let data;
      try {
        data = await fetchProjectsList(params);
      } catch {
        data = await fetchExploreProjects(params);
      }
      const list = (data.projects || []).map((p, idx) => ({
        ...p,
        id: p.id || `exp-${idx}`,
        imageUrl: p.imageurl || p.imageUrl || '',
      }));
      if (list.length) {
        setProjects(list);
        setTotal(data.total ?? list.length);
      } else if (!query.trim() && page === 1) {
        setProjects(EXPLORE_PROJECTS);
        setTotal(EXPLORE_PROJECTS.length);
      } else {
        setProjects([]);
        setTotal(0);
      }
    } catch {
      setProjects(EXPLORE_PROJECTS);
      setTotal(EXPLORE_PROJECTS.length);
    }
  }, [userId, query, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(total / EXPLORE_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const handleSave = async (project) => {
    try {
      await toggleSaveExplore(project);
      window.alert(`Saved "${project.title}" to your list.`);
    } catch {
      window.alert('Could not save project.');
    }
  };

  return (
    <div className="ph-center-stack ph-explore">
      <ProjectsViewHeader
        title="Explore Projects"
        subtitle="Discover amazing projects from the community."
      />
      <ExploreToolbar
        query={query}
        onQueryChange={setQuery}
        onFilter={() => window.alert('Explore filters coming soon.')}
      />
      <div className="ph-exp-grid">
        {projects.map((project) => (
          <ExploreProjectCard
            key={project.id}
            project={project}
            onOpen={onOpenProject}
            onSave={handleSave}
          />
        ))}
      </div>
      {projects.length === 0 ? (
        <p className="ph-exp-empty">No projects match your search.</p>
      ) : null}
      <ExplorePagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
