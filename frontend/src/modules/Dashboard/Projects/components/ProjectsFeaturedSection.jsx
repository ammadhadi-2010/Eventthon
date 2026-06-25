import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FEATURED_PROJECTS } from '../data/projectsHubData';
import ProjectCard from './ProjectCard';

const SCROLL_STEP = 300;

export default function ProjectsFeaturedSection({ projects = FEATURED_PROJECTS, onOpenProject }) {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < max - 4);
  }, []);

  const scrollBy = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * SCROLL_STEP, behavior: 'smooth' });
    window.setTimeout(updateScrollState, 280);
  };

  useEffect(() => {
    updateScrollState();
    const el = trackRef.current;
    if (!el) return undefined;
    const onResize = () => updateScrollState();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [projects, updateScrollState]);

  return (
    <section className="ph-card ph-featured">
      <header className="ph-section-head">
        <h2 className="ph-section-title ph-mobile-section-title">Featured Projects</h2>
        <Link to="/projects/all" className="ph-link-btn">
          View All
        </Link>
      </header>
      <div className="ph-featured-carousel">
        <button
          type="button"
          className="ph-featured-arrow ph-featured-arrow--left"
          onClick={() => scrollBy(-1)}
          disabled={!canScrollLeft}
          aria-label="Previous featured projects"
        >
          <FiChevronLeft size={22} />
        </button>
        <div
          ref={trackRef}
          className="ph-featured-track"
          onScroll={updateScrollState}
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onOpen={onOpenProject} />
          ))}
        </div>
        <button
          type="button"
          className="ph-featured-arrow ph-featured-arrow--right"
          onClick={() => scrollBy(1)}
          disabled={!canScrollRight}
          aria-label="Next featured projects"
        >
          <FiChevronRight size={22} />
        </button>
      </div>
    </section>
  );
}
