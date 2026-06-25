import React from 'react';

export default function ProjectShowroomAside({ data }) {
  return (
    <aside className="ps-aside" aria-label="Project details">
      <section className="ps-aside-card">
        <h2>Project Description</h2>
        <p>{data.longDescription || data.summary}</p>
        {data.features?.length > 0 ? (
          <ul className="ps-feature-list">
            {data.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="ps-aside-card">
        <h2>Tech Stack</h2>
        <div className="ps-stack-grid">
          {(data.techStackTags || []).map((tag) => (
            <span key={tag} className="ps-stack-pill">
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="ps-aside-card ps-meta-footer">
        <p>
          <span>Created</span> {data.createdLabel}
        </p>
        <p>
          <span>Updated</span> {data.updatedLabel}
        </p>
        <p>
          <span>License</span> {data.license}
        </p>
        <p>
          <span>Visibility</span> {data.visibility}
        </p>
        <p>
          <span>Squad</span> {data.squadName}
        </p>
      </section>
    </aside>
  );
}
