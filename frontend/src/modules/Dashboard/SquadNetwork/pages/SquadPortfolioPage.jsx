import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import { fetchSquadDetail } from '../api/squadsApi';
import { fetchSquadProjects } from '../api/squadProjectsApi';
import { DEFAULT_PORTFOLIO } from '../components/workspace/squadWorkspaceData';
import { resolveSquadProjectCover } from '../components/projects/squadProjectCardModel';
import '../styles/squad-view-all-pages.css';

function buildPortfolioItems(projects = []) {
  const fromProjects = projects.map((p, i) => ({
    id: p.id || p._id || `proj-${i}`,
    title: p.title || p.name || 'Untitled Project',
    image: resolveSquadProjectCover(p),
    demoUrl: p.live_url || p.liveUrl || p.github_url || '',
    status: p.status || 'In Progress',
  }));
  if (fromProjects.length) return fromProjects;
  return DEFAULT_PORTFOLIO;
}

export default function SquadPortfolioPage() {
  const { id: squadId } = useParams();
  const [squad, setSquad] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!squadId) return undefined;
    let alive = true;
    setLoading(true);
    Promise.all([
      fetchSquadDetail(squadId).catch(() => ({ squad_name: 'Squad', _id: squadId })),
      fetchSquadProjects(squadId).catch(() => []),
    ]).then(([squadData, projectData]) => {
      if (!alive) return;
      setSquad(squadData?.squad || squadData?.data || squadData || null);
      const rows = Array.isArray(projectData)
        ? projectData
        : projectData?.projects || projectData?.data || [];
      setProjects(rows);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [squadId]);

  const items = useMemo(() => buildPortfolioItems(projects), [projects]);
  const squadName = squad?.squad_name || 'Squad';

  return (
    <div className="sq-view-page">
      <header className="sq-view-page__bar">
        <Link to="/squads" className="sq-view-page__back">
          <FiArrowLeft size={16} aria-hidden /> Back to Squads
        </Link>
        <div className="sq-view-page__titles">
          <h1>{squadName} · Portfolio</h1>
          <p>Highlight work and live demos from this squad.</p>
        </div>
      </header>

      {loading ? (
        <p className="sq-view-page__empty">Loading portfolio…</p>
      ) : (
        <div className="sq-portfolio-grid">
          {items.map((item) => (
            <article key={item.id} className="sq-portfolio-grid__card">
              <div
                className="sq-portfolio-grid__thumb"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              <div className="sq-portfolio-grid__meta">
                <strong>{item.title}</strong>
                {item.status ? <span>{item.status}</span> : null}
                {item.demoUrl ? (
                  <a href={item.demoUrl} target="_blank" rel="noreferrer">
                    <FiExternalLink size={14} aria-hidden /> Live Demo
                  </a>
                ) : (
                  <span className="sq-portfolio-grid__muted">Demo coming soon</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
