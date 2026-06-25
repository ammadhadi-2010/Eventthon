import React from 'react';
import { FiMessageCircle, FiUsers, FiDollarSign } from 'react-icons/fi';
import ProjectRowMenu from '../shared/ProjectRowMenu';
import ExploreRating from './ExploreRating';

export default function ExploreProjectCard({ project, onOpen, onSave }) {
  const open = () => onOpen?.(project);
  const menuItems = [
    { id: 'view', label: 'View project', onClick: () => onOpen?.(project) },
    { id: 'save', label: 'Save project', onClick: () => onSave?.(project) },
  ];

  return (
    <article
      className="ph-exp-card"
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
    >
      <div className="ph-exp-card__media">
        <img
          src={project.imageurl || project.imageUrl || ''}
          alt=""
          className="ph-exp-card__img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <span className={`ph-exp-badge ph-exp-badge--${project.badgeTone}`}>{project.badge}</span>
        <div
          className="ph-exp-card__menu"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          role="presentation"
        >
          <ProjectRowMenu label={`Options for ${project.title}`} items={menuItems} />
        </div>
      </div>
      <div className="ph-exp-card__body">
        <div className="ph-exp-card__title-row">
          <h3>{project.title}</h3>
          <ExploreRating rating={project.rating} />
        </div>
        <p className="ph-exp-author">By {project.author}</p>
        <footer className="ph-exp-stats">
          <span>
            <FiUsers size={13} aria-hidden />
            {project.members}
          </span>
          <span>
            <FiMessageCircle size={13} aria-hidden />
            {project.comments}
          </span>
          <span>
            <FiDollarSign size={13} aria-hidden />
            {project.funding}
          </span>
        </footer>
      </div>
    </article>
  );
}
