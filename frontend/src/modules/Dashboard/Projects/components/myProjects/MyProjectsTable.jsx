import React from 'react';
import { FiSliders } from 'react-icons/fi';
import ProjectRowMenu from '../shared/ProjectRowMenu';
import { buildOwnerProjectMenuItems } from '../../hooks/projectRowMenuItems';
import StatusBadge from './StatusBadge';
import AvatarStack from './AvatarStack';
import MyProjectsProgress from './MyProjectsProgress';
import { MY_PROJECTS_TABS } from './myProjectsTabs';

function ProjectCell({ row }) {
  return (
    <div className="ph-mp-project">
      <span className={`ph-mp-project-icon ph-mp-project-icon--${row.iconTone}`}>
        {row.iconGlyph || row.name.charAt(0)}
      </span>
      <div>
        <strong>{row.name}</strong>
        <small>{row.category}</small>
      </div>
    </div>
  );
}

function MyProjectMobileCard({ row, onOpenProject, onProjectAction }) {
  return (
    <article className="ph-mp-mobile-card">
      <div className="ph-mp-mobile-top">
        <div className="ph-mp-mobile-title-wrap">
          <strong className="ph-mp-mobile-title">{row.name}</strong>
          <StatusBadge status={row.status} />
        </div>
        <ProjectRowMenu
          label={`Options for ${row.name}`}
          items={buildOwnerProjectMenuItems({
            row,
            onView: onOpenProject,
            onAction: onProjectAction,
          })}
        />
      </div>
      <div className="ph-mp-mobile-mid">
        <MyProjectsProgress value={row.progress} status={row.status} />
        <AvatarStack members={row.team} extra={row.teamExtra ?? 0} />
      </div>
      <div className="ph-mp-mobile-meta">
        <span>{row.deadline}</span>
        <span>{row.budget}</span>
      </div>
    </article>
  );
}

export default function MyProjectsTable({
  rows,
  activeTab,
  onTabChange,
  onFilter,
  tabCounts,
  onOpenProject,
  onProjectAction,
}) {
  const tabs = MY_PROJECTS_TABS.map((tab) => ({
    ...tab,
    count: tabCounts?.[tab.id] ?? tab.count,
  }));
  return (
    <section className="ph-card ph-mp-table-card">
      <div className="ph-mp-table-head">
        <div className="ph-mp-tabs" role="tablist" aria-label="Project filters">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`ph-mp-tab${activeTab === tab.id ? ' is-active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <button type="button" className="ph-mp-filter-btn" onClick={onFilter}>
          <FiSliders size={14} aria-hidden />
          Filter
        </button>
      </div>
      <div className="ph-mp-mobile-list" aria-label="My projects list">
        {rows.length === 0 ? (
          <p className="ph-table-empty">No projects match this filter.</p>
        ) : (
          rows.map((row) => (
            <MyProjectMobileCard
              key={row.id}
              row={row}
              onOpenProject={onOpenProject}
              onProjectAction={onProjectAction}
            />
          ))
        )}
      </div>
      <div className="ph-table-scroll">
        <table className="ph-table ph-mp-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Team</th>
              <th>Deadline</th>
              <th>Budget</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="ph-table-empty">
                  No projects match this filter.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="ph-mp-row">
                  <td>
                    <ProjectCell row={row} />
                  </td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td>
                    <MyProjectsProgress value={row.progress} status={row.status} />
                  </td>
                  <td>
                    <AvatarStack members={row.team} extra={row.teamExtra ?? 0} />
                  </td>
                  <td className="ph-mp-deadline">{row.deadline}</td>
                  <td className="ph-mp-budget">{row.budget}</td>
                  <td>
                    <ProjectRowMenu
                      label={`Options for ${row.name}`}
                      items={buildOwnerProjectMenuItems({
                        row,
                        onView: onOpenProject,
                        onAction: onProjectAction,
                      })}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
