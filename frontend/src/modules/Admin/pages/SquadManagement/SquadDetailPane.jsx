import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, X, Edit3, MoreVertical } from 'lucide-react';
import {
  getSquadDetailTabs,
  resolveSquadImageurl,
  SQUAD_STATUS_CLASS,
} from './squadData';
import {
  buildSquadActivities,
  buildSquadMembers,
  buildSquadProjects,
  SquadActivityPanel,
  SquadDetailItem,
  SquadKpi,
  SquadMembersPanel,
  SquadProjectsPanel,
  SquadSettingsPanel,
} from './squadDetailPanels';
import SquadEditModal from './SquadEditModal';

export default function SquadDetailPane({
  squad,
  loading = false,
  onClose,
  onPatch,
  onStatusChange,
  onDisband,
  showClose = true,
}) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [editOpen, setEditOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: squad.name || '',
    category: squad.category || '',
    description: squad.description || '',
  });
  const [status, setStatus] = useState(squad.status || 'ACTIVE');
  const actionsRef = useRef(null);

  useEffect(() => {
    setDraft({
      name: squad.name || '',
      category: squad.category || '',
      description: squad.description || '',
    });
    setStatus(squad.status || 'ACTIVE');
    setActiveTab('Overview');
  }, [squad.id, squad.name, squad.category, squad.description, squad.status]);

  useEffect(() => {
    if (!actionsOpen) return undefined;
    const close = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) setActionsOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [actionsOpen]);

  const displaySquad = { ...squad, ...draft, status };
  const metrics = displaySquad.metrics || { online: 0, projects: 0, completed: 0, rating: '0.0' };
  const rules = displaySquad.rules || ['Keep discussions professional', 'Respect all squad members'];
  const tabs = getSquadDetailTabs(displaySquad);
  const members = buildSquadMembers(displaySquad);
  const leaderProfile =
    members.find((member) => /admin|leader/i.test(String(member.role || ''))) || members[0];
  const projects = buildSquadProjects(displaySquad);
  const activities = buildSquadActivities(displaySquad);

  const applyStatus = (next) => {
    setStatus(next);
    setActionsOpen(false);
    onStatusChange?.(squad, next);
  };

  const saveDraft = (nextDraft) => {
    setDraft(nextDraft);
    onPatch?.(squad.id, nextDraft);
  };

  return (
    <section className={`um-card sd-pane${loading ? ' sd-pane--loading' : ''}`}>
      <button type="button" className="sd-pane__back" onClick={onClose}>
        <ArrowLeft size={16} aria-hidden />
        Back to Squads
      </button>

      <header className="sd-pane__head">
        <div>
          <p className="sd-pane__eyebrow">Squad drill-down</p>
          <h2 className="sd-pane__title">{displaySquad.name}</h2>
        </div>
        <div className="sd-pane__actions">
          <button type="button" className="um-btn um-btn--ghost um-btn--compact" onClick={() => setEditOpen(true)}>
            <Edit3 size={14} />
            Edit Squad
          </button>
          <div className="sd-actions-wrap" ref={actionsRef}>
            <button
              type="button"
              className="um-btn um-btn--ghost um-btn--compact"
              onClick={() => setActionsOpen((v) => !v)}
              aria-expanded={actionsOpen}
            >
              Actions
              <MoreVertical size={14} />
            </button>
            {actionsOpen ? (
              <div className="sd-actions-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => applyStatus('ACTIVE')}>
                  Change Status — Active
                </button>
                <button type="button" role="menuitem" onClick={() => applyStatus('SUSPENDED')}>
                  Change Status — Suspended
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setActionsOpen(false);
                    onDisband?.(squad);
                  }}
                >
                  Disband Squad
                </button>
              </div>
            ) : null}
          </div>
          {showClose ? (
            <button type="button" className="um-row-menu" aria-label="Close squad details" onClick={onClose}>
              <X size={16} />
            </button>
          ) : null}
        </div>
      </header>

      <div className="sd-hero__top">
        <img src={resolveSquadImageurl(displaySquad)} alt="" className="sd-hero__avatar" />
        <div className="sd-hero__meta">
          <p>{displaySquad.handle}</p>
          <div className="sd-hero__chips">
            <span className="um-role-pill">{displaySquad.category}</span>
            <span className={`um-status-chip ${SQUAD_STATUS_CLASS[displaySquad.status]}`}>
              {displaySquad.status}
            </span>
            <span className="sd-muted">Created {displaySquad.createdOn}</span>
          </div>
        </div>
      </div>

      <p className="sd-description">{displaySquad.description || 'No squad description available.'}</p>

      <div className="sd-kpis">
        <SquadKpi label="Total Members" value={displaySquad.members} />
        <SquadKpi label="Online" value={metrics.online} />
        <SquadKpi label="Projects" value={metrics.projects} />
        <SquadKpi label="Completed" value={metrics.completed} />
        <SquadKpi label="Avg Rating" value={metrics.rating} />
      </div>

      <div className="um-toolbar-tabs sd-pane__tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`um-tab ${activeTab === tab ? 'um-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' ? (
        <div className="sd-grid">
          <article className="sd-panel">
            <h3>Squad Leader</h3>
            <div className="sd-leader">
              <img
                src={resolveSquadImageurl({
                  name: leaderProfile?.name || squad.leader,
                  imageurl: squad.leaderImageurl || leaderProfile?.imageurl,
                })}
                alt=""
                className="um-avatar sd-profile-avatar"
              />
              <div>
                <p>{leaderProfile?.name || squad.leader}</p>
                <span>{leaderProfile?.handle || squad.leaderHandle || '@leader'}</span>
              </div>
            </div>
            <dl>
              <SquadDetailItem label="Created On" value={displaySquad.createdOn} />
              <SquadDetailItem label="Category" value={displaySquad.category} />
              <SquadDetailItem label="Visibility" value={displaySquad.visibility || 'Public'} />
              <SquadDetailItem label="Squad Type" value={displaySquad.squadType || 'Professional'} />
            </dl>
          </article>
          <article className="sd-panel">
            <h3>Performance Logs</h3>
            <SquadActivityPanel activities={activities} />
            <h4>Rules</h4>
            <ul className="sd-rules">
              {rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </article>
        </div>
      ) : null}
      {activeTab.startsWith('Members') ? (
        <SquadMembersPanel members={members} resolveImageurl={resolveSquadImageurl} />
      ) : null}
      {activeTab.startsWith('Projects') ? <SquadProjectsPanel projects={projects} /> : null}
      {activeTab === 'Activity' ? <SquadActivityPanel activities={activities} /> : null}
      {activeTab === 'Settings' ? <SquadSettingsPanel squad={displaySquad} /> : null}

      {editOpen ? (
        <SquadEditModal
          draft={draft}
          squadId={squad.id}
          onClose={() => setEditOpen(false)}
          onSave={saveDraft}
        />
      ) : null}
    </section>
  );
}
