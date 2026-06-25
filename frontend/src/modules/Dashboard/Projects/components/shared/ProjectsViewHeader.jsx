import React from 'react';

export default function ProjectsViewHeader({ title, subtitle, action }) {
  return (
    <header className="ph-hero">
      <div>
        <h1 className="ph-hero-title">{title}</h1>
        {subtitle ? <p className="ph-hero-sub">{subtitle}</p> : null}
      </div>
      {action || null}
    </header>
  );
}
