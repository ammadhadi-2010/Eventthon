import React, { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FEATURED_PROJECTS } from '../data/projectsHubData';
import ProjectCard from './ProjectCard';

const AUTO_PLAY_MS = 3800;

export default function ProjectsFeaturedSection({ projects = FEATURED_PROJECTS, onOpenProject }) {
  const trackRef = useRef(null);
  const pausedRef = useRef(false);

  const loopProjects = useMemo(
    () => (projects.length > 1 ? [...projects, ...projects] : projects),
    [projects],
  );

  useEffect(() => {
    const el = trackRef.current;
    if (!el || projects.length <= 1) return undefined;

    const advance = () => {
      if (pausedRef.current) return;

      const card = el.querySelector('.ph-pcard');
      const step = (card?.offsetWidth || 280) + 12;
      const loopWidth = el.scrollWidth / 2;

      if (el.scrollLeft >= loopWidth - 4) {
        el.scrollTo({ left: 0, behavior: 'auto' });
        window.requestAnimationFrame(() => {
          el.scrollBy({ left: step, behavior: 'smooth' });
        });
        return;
      }

      el.scrollBy({ left: step, behavior: 'smooth' });
    };

    const timer = window.setInterval(advance, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [projects]);

  return (
    <section className="ph-card ph-featured">
      <header className="ph-section-head">
        <h2 className="ph-section-title ph-mobile-section-title">Featured Projects</h2>
        <Link to="/projects/all" className="ph-link-btn">
          View All
        </Link>
      </header>
      <div
        className="ph-featured-carousel"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        onFocusCapture={() => { pausedRef.current = true; }}
        onBlurCapture={() => { pausedRef.current = false; }}
      >
        <div ref={trackRef} className="ph-featured-track" aria-live="off">
          {loopProjects.map((project, index) => (
            <ProjectCard
              key={`${project.id}-${index}`}
              project={project}
              onOpen={onOpenProject}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
