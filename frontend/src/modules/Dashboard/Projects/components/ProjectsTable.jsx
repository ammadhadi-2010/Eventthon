import React from 'react';
import ProjectRowMenu from './shared/ProjectRowMenu';
import { buildOwnerProjectMenuItems } from '../hooks/projectRowMenuItems';
import { STATUS_LABELS } from '../data/projectsHubData';

function TeamRow({ team }) {
  return (
    <div className="ph-table-team">
      {team.map((t) => (
        <span key={t} className="ph-table-team-av">
          {t}
        </span>
      ))}
    </div>
  );
}

export default function ProjectsTable({
  rows,
  tableTab,
  onTabChange,
  tableTabs,
  onOpenProject,
  onProjectAction,
}) {
  return (
    <section className="ph-card ph-table-wrap">
      <header className="ph-section-head">
        <h2 className="ph-section-title">My Projects</h2>
      </header>
      <div className="ph-table-tabs" role="tablist">
        {(tableTabs || []).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tableTab === tab.id}
            className={`ph-table-tab${tableTab === tab.id ? ' is-active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>
      <div className="ph-table-mobile-list" aria-label="Projects list">
        {rows.length === 0 ? (
          <p className="ph-table-mobile-empty">No projects match this filter.</p>
        ) : (
          rows.map((row) => (
            <article key={row.id} className="ph-table-mobile-card">
              <div className="ph-table-mobile-top">
                <div className="ph-table-project">
                  <span className={`ph-table-icon ph-table-icon--${row.iconTone}`}>{row.name.charAt(0)}</span>
                  <div>
                    <strong>{row.name}</strong>
                    <small>{row.category}</small>
                  </div>
                </div>
                <span className={`ph-status ph-status--${row.status}`}>{STATUS_LABELS[row.status]}</span>
                <ProjectRowMenu
                  label={`Options for ${row.name}`}
                  items={buildOwnerProjectMenuItems({
                    row,
                    onView: onOpenProject,
                    onAction: onProjectAction,
                  })}
                />
              </div>
              <div className="ph-table-mobile-progress">
                <div className="ph-pcard-progress-track">
                  <span style={{ width: `${row.progress}%` }} />
                </div>
                <span className="ph-table-mobile-pct">{row.progress}%</span>
              </div>
              <div className="ph-table-mobile-meta">
                <span>{row.budget}</span>
                <TeamRow team={row.team} />
              </div>
            </article>
          ))
        )}
      </div>
      <div className="ph-table-scroll">
        <table className="ph-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Budget</th>
              <th>Team</th>
              <th>Deadline</th>
              <th>Updated</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="ph-table-empty">
                  No projects match this filter.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="ph-table-project">
                      <span className={`ph-table-icon ph-table-icon--${row.iconTone}`}>{row.name.charAt(0)}</span>
                      <div>
                        <strong>{row.name}</strong>
                        <small>{row.category}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`ph-status ph-status--${row.status}`}>{STATUS_LABELS[row.status]}</span>
                  </td>
                  <td>
                    <div className="ph-table-progress">
                      <div className="ph-pcard-progress-track">
                        <span style={{ width: `${row.progress}%` }} />
                      </div>
                      <small>{row.progress}%</small>
                    </div>
                  </td>
                  <td>{row.budget}</td>
                  <td>
                    <TeamRow team={row.team} />
                  </td>
                  <td>{row.deadline}</td>
                  <td>{row.updated}</td>
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
