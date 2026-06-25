import React from 'react';
import { FiSliders } from 'react-icons/fi';
import ProjectRowMenu from '../shared/ProjectRowMenu';
import AvatarStack from '../myProjects/AvatarStack';
import MyProjectsProgress from '../myProjects/MyProjectsProgress';
import OwnerCell from './OwnerCell';
import { COLLABORATIONS_TABS } from './collaborationsTabs';

function ProjectRoleCell({ row }) {
  return (
    <div className="ph-mp-project">
      <span className={`ph-mp-project-icon ph-mp-project-icon--${row.iconTone}`}>
        {row.iconGlyph || row.name.charAt(0)}
      </span>
      <div>
        <strong>{row.name}</strong>
        <small className="ph-col-role">{row.roleLabel}</small>
      </div>
    </div>
  );
}

function CollaborationMobileCard({ row, onOpenProject }) {
  return (
    <article className="ph-mp-mobile-card ph-col-mobile-card">
      <div className="ph-mp-mobile-top">
        <div className="ph-mp-mobile-title-wrap">
          <strong className="ph-mp-mobile-title">{row.name}</strong>
          <span className="ph-mp-mobile-role">{row.roleLabel}</span>
        </div>
        <ProjectRowMenu
          label={`Options for ${row.name}`}
          items={[
            { id: 'view', label: 'View project', onClick: () => onOpenProject?.(row) },
            { id: 'message', label: 'Message team', onClick: () => window.alert(`Messaging for ${row.name} coming soon.`) },
          ]}
        />
      </div>
      <div className="ph-mp-mobile-bottom">
        <AvatarStack members={row.team} extra={row.teamExtra ?? 0} />
        <MyProjectsProgress
          value={row.progress}
          status={row.progressStatus || 'in-progress'}
          tone={row.progressTone}
        />
      </div>
    </article>
  );
}

export default function CollaborationsTable({ rows, activeTab, onTabChange, onFilter, onOpenProject }) {
  return (
    <section className="ph-card ph-mp-table-card ph-collaborations-table">
      <div className="ph-mp-table-head">
        <div className="ph-mp-tabs" role="tablist" aria-label="Collaboration filters">
          {COLLABORATIONS_TABS.map((tab) => (
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
      <div className="ph-mp-mobile-list" aria-label="Collaborations list">
        {rows.length === 0 ? (
          <p className="ph-table-empty">No collaborations match this filter.</p>
        ) : (
          rows.map((row) => (
            <CollaborationMobileCard key={row.id} row={row} onOpenProject={onOpenProject} />
          ))
        )}
      </div>
      <div className="ph-table-scroll">
        <table className="ph-table ph-mp-table ph-col-table">
          <thead>
            <tr>
              <th>Project & Role</th>
              <th>Owner</th>
              <th>Team</th>
              <th>Progress</th>
              <th>Last Activity</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="ph-table-empty">
                  No collaborations match this filter.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="ph-mp-row">
                  <td>
                    <ProjectRoleCell row={row} />
                  </td>
                  <td>
                    <OwnerCell name={row.ownerName} initials={row.ownerInitials} isYou={row.ownerIsYou} />
                  </td>
                  <td>
                    <AvatarStack members={row.team} extra={row.teamExtra ?? 0} />
                  </td>
                  <td>
                    <MyProjectsProgress
                      value={row.progress}
                      status={row.progressStatus || 'in-progress'}
                      tone={row.progressTone}
                    />
                  </td>
                  <td className="ph-col-activity">{row.lastActivity}</td>
                  <td>
                    <ProjectRowMenu
                      label={`Options for ${row.name}`}
                      items={[
                        { id: 'view', label: 'View project', onClick: () => onOpenProject?.(row) },
                        { id: 'message', label: 'Message team', onClick: () => window.alert(`Messaging for ${row.name} coming soon.`) },
                      ]}
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
