import React from 'react';
import ProjectsViewHeader from '../components/shared/ProjectsViewHeader';

const SETTINGS_ROWS = [
  { id: 's1', label: 'Email notifications for milestones', on: true },
  { id: 's2', label: 'Show budget totals on overview', on: true },
  { id: 's3', label: 'Auto-archive completed projects after 30 days', on: false },
  { id: 's4', label: 'Share activity with squad leads', on: true },
];

export default function Settings() {
  return (
    <div className="ph-center-stack">
      <ProjectsViewHeader title="Project Settings" subtitle="Configure defaults for your Projects Hub workspace." />
      <section className="ph-card ph-settings-list">
        {SETTINGS_ROWS.map((row) => (
          <label key={row.id} className="ph-settings-row">
            <span>{row.label}</span>
            <input type="checkbox" defaultChecked={row.on} />
          </label>
        ))}
      </section>
    </div>
  );
}
