import React from 'react';

export default function ProjectExplorerLeftList({ rows, selectedProject, selectProjectRow }) {
  return (
    <aside className="gigx-left">
      <div className="gigx-left-head">
        <h3>Featured</h3>
        <p>{rows.length} projects</p>
      </div>
      {rows.length === 0 ? (
        <p className="gigx-left-empty">No featured projects matched your search.</p>
      ) : (
        rows.map((project) => (
          <article
            key={project.id}
            className={`gigx-left-row${selectedProject?.id === project.id ? ' is-active' : ''}`}
            onClick={() => selectProjectRow(project.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') selectProjectRow(project.id);
            }}
          >
            <div className="gigx-left-thumb">
              {(project.category || 'PR').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4>{project.title}</h4>
              <p>
                {project.agency} • {project.category}
              </p>
              <small>{project.progress}% • {project.budget}</small>
            </div>
            <strong>{project.budget}</strong>
          </article>
        ))
      )}
    </aside>
  );
}
