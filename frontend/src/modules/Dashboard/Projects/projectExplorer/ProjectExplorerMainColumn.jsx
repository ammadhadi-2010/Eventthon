import React, { useMemo } from 'react';
import {
  FiCheck,
  FiChevronRight,
  FiClock,
  FiUsers,
} from 'react-icons/fi';
import GigExplorerFaqTab from '../../Gigs/gigExplorer/GigExplorerFaqTab';
import GigExplorerReviewsTab from '../../Gigs/gigExplorer/GigExplorerReviewsTab';
import { PROJECT_DETAIL_TABS } from './constants';
import ProjectExplorerOverviewPanel from './ProjectExplorerOverviewPanel';
import ProjectTemplateBadges from '../shared/ProjectTemplateBadges';
import { normalizeProjectView } from '../utils/projectViewModel';
import { PROJECT_FAQ_ITEMS, buildProjectReviewRows, projectAsGigShape } from './projectDetailHelpers';

function MilestonesPanel({ project }) {
  return (
    <div className="gigx-about-card">
      <h3>Milestones</h3>
      <ul>
        {(project.milestones || []).map((m) => (
          <li key={m}>
            <FiCheck size={12} /> {m}
          </li>
        ))}
      </ul>
      <p className="gigx-assets">
        Deadline: <strong>{project.deadline}</strong>
      </p>
    </div>
  );
}

function TeamPanel({ project }) {
  return (
    <div className="gigx-about-card">
      <h3>Team & skills</h3>
      <p>Members: {(project.team || []).join(', ') || 'Open collaboration slots'}</p>
      <div className="gigx-tags">
        {(project.skills || []).map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
    </div>
  );
}

export default function ProjectExplorerMainColumn({ project, detailTab, setTab }) {
  const view = useMemo(() => normalizeProjectView(project), [project]);
  const title = view.title;
  const crumb = title.length > 28 ? `${title.slice(0, 28)}...` : title;
  const gigShape = useMemo(() => projectAsGigShape(project), [project]);
  const reviewRows = useMemo(() => buildProjectReviewRows(project), [project]);

  return (
    <section className="gigx-main">
      <div className="gigx-breadcrumbs">
        <span>Projects</span>
        <FiChevronRight size={12} aria-hidden />
        <span>Featured</span>
        <FiChevronRight size={12} aria-hidden />
        <span>{crumb}</span>
      </div>

      <h2>{title}</h2>

      <div className="gigx-seller-row">
        <div className="gigx-avatar">{(project.agency || 'ST').slice(0, 1)}</div>
        <p>{project.agency}</p>
        <span>{project.category}</span>
        {project.verified ? (
          <strong>
            <FiCheck size={11} /> Verified studio
          </strong>
        ) : null}
      </div>

      <div className="gigx-meta-bar">
        <span
          className={`gigx-status-pill is-${String(project.status || 'in-progress')
            .toLowerCase()
            .replace(/\s+/g, '-')}`}
        >
          {project.status_label || project.status}
        </span>
        <ProjectTemplateBadges
          category={view.category}
          subCategory={view.subCategory}
          templateName={view.templateName}
          templateUses={view.templateUses}
        />
        <span className="gigx-meta-chip">
          <FiClock size={13} aria-hidden /> {project.deadline}
        </span>
        <span className="gigx-meta-chip">
          <FiUsers size={13} aria-hidden /> {(project.team || []).length} members
        </span>
        <span className="gigx-meta-chip">{project.budget} budget</span>
      </div>

      <div className="gigx-tabs" role="tablist" aria-label="Project sections">
        {PROJECT_DETAIL_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={detailTab === tab.id}
            className={detailTab === tab.id ? 'is-active' : ''}
            onClick={() => setTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="gigx-tab-panels">
        {detailTab === 'overview' ? <ProjectExplorerOverviewPanel project={project} /> : null}
        {detailTab === 'milestones' ? <MilestonesPanel project={project} /> : null}
        {detailTab === 'team' ? <TeamPanel project={project} /> : null}
        {detailTab === 'reviews' ? (
          <GigExplorerReviewsTab selectedGig={gigShape} reviewRows={reviewRows} />
        ) : null}
        {detailTab === 'faq' ? <GigExplorerFaqTab faqItems={PROJECT_FAQ_ITEMS} /> : null}
      </div>
    </section>
  );
}
