import React, { useMemo, useState } from 'react';
import { FiCheck, FiClock, FiHeart, FiMessageCircle, FiShield, FiShare2 } from 'react-icons/fi';
import { normalizeProjectView } from '../utils/projectViewModel';
import ProjectJoinActions from './ProjectJoinActions';
import ProjectPackageSelectButton from '../components/ProjectPackageSelectButton';
import { deriveProjectPackageTiers } from './projectDetailHelpers';
import '../../SquadNetwork/styles/squad-project-detail.css';
import '../styles/project-detail-view.css';

export default function ProjectExplorerRightRail({
  project,
  activePackage,
  setActivePackage,
  onShare,
  onJoin,
  onBrowse,
  joining = false,
  joinError = '',
  hasJoined = false,
  onSelectPackage,
  selectingPackage = false,
  packageError = '',
  confirmedPackageKey = null,
}) {
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState('');
  const view = useMemo(() => normalizeProjectView(project), [project]);
  const packageTiers = useMemo(() => deriveProjectPackageTiers(view), [view]);
  const sidebarTier = packageTiers.find((t) => t.key === activePackage) || packageTiers[1] || packageTiers[0];
  const features =
    view.pricingTiers?.[activePackage]?.features ||
    sidebarTier?.features ||
    ['Milestone delivery', 'Squad collaboration', 'File sharing'];

  const showToast = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2200);
  };

  return (
    <aside className="gigx-right ph-project-rail">
      {toast ? (
        <div className="gigx-sidebar-toast" role="status">
          {toast}
        </div>
      ) : null}

      <div className="gigx-actions">
        <button type="button" onClick={onShare}>
          <FiShare2 size={12} /> Share
        </button>
        <button
          type="button"
          className={saved ? 'is-saved' : ''}
          onClick={() => {
            setSaved((v) => !v);
            showToast(saved ? 'Removed from saved' : 'Project saved');
          }}
        >
          <FiHeart size={12} /> {saved ? 'Saved' : 'Save'}
        </button>
        <button type="button" onClick={() => showToast('Thanks for your report.')}>
          Report
        </button>
      </div>

      <dl className="pdv-sidebar-meta">
        <div>
          <dt>Budget range</dt>
          <dd>{view.budgetRange || '—'}</dd>
        </div>
        <div>
          <dt>Experience level</dt>
          <dd>{view.experienceLevel || '—'}</dd>
        </div>
        <div>
          <dt>Work mode</dt>
          <dd>{view.workMode || '—'}</dd>
        </div>
        <div>
          <dt>Timeline</dt>
          <dd>{view.timeline || '—'}</dd>
        </div>
      </dl>

      <div className="gigx-package-card">
        <div className="gigx-package-tabs">
          {packageTiers.map((tier) => (
            <button
              key={tier.key}
              type="button"
              className={activePackage === tier.key ? 'is-active' : ''}
              onClick={() => setActivePackage(tier.key)}
            >
              {tier.label}
            </button>
          ))}
        </div>
        <div className="gigx-package-body">
          <div className="gigx-package-price ph-rail-package__head">
            <h4 className="ph-rail-package__label">{sidebarTier?.label || 'Standard'} package</h4>
            <strong className="ph-rail-package__price-value">${sidebarTier?.price ?? 0}</strong>
          </div>
          <p className="ph-rail-package__copy">Collaboration tier for {project.title}.</p>
          <p className="gigx-package-meta ph-rail-package__meta">
            <FiClock size={12} aria-hidden /> {sidebarTier?.delivery} days · {sidebarTier?.revisions}{' '}
            revisions
          </p>
          <ul className="ph-rail-package__features">
            {features.map((feature) => (
              <li key={feature}>
                <FiCheck size={12} aria-hidden /> {feature}
              </li>
            ))}
          </ul>
          <ProjectJoinActions
            embedded
            onJoin={onJoin}
            joining={joining}
            joinError={joinError}
            hasJoined={hasJoined}
          />
          <ProjectPackageSelectButton
            activePackage={activePackage}
            onSelect={() => onSelectPackage?.(activePackage, sidebarTier)}
            selecting={selectingPackage}
            confirmedKey={confirmedPackageKey}
            error={packageError}
          />
        </div>
      </div>

      <div className="gigx-mini-card">
        <h4>
          <FiShield size={13} /> Secure collaboration
        </h4>
        <p>Milestones, files, and squad chat stay inside EventThon.</p>
      </div>

      <div className="gigx-mini-card">
        <h4>Have a question?</h4>
        <p>Message the project lead before you join.</p>
        <button type="button" onClick={() => onSelectPackage?.(activePackage, sidebarTier)}>
          <FiMessageCircle size={12} /> Submit Proposal
        </button>
      </div>

      <div className="gigx-mini-card">
        <button type="button" onClick={onBrowse}>
          Browse all projects
        </button>
      </div>
    </aside>
  );
}
