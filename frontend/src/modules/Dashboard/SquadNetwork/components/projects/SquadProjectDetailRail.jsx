import React, { useMemo, useState } from 'react';
import { FiCheck, FiClock } from 'react-icons/fi';
import { deriveProjectPackageTiers } from '../../../Projects/projectExplorer/projectDetailHelpers';
import { normalizeProjectView } from '../../../Projects/utils/projectViewModel';

import ProjectPackageSelectButton from '../../../Projects/components/ProjectPackageSelectButton';
import SquadProjectJoinPanel from './SquadProjectJoinPanel';

export default function SquadProjectDetailRail({
  project,
  onJoinCollaborate,
  joining,
  joinError,
  hasJoined,
  contributorCount = 0,
  onSelectPackage,
  selectingPackage = false,
  packageError = '',
  confirmedPackageKey = null,
}) {
  const [activePackage, setActivePackage] = useState('standard');
  const view = useMemo(() => normalizeProjectView(project), [project]);
  const packageTiers = useMemo(() => deriveProjectPackageTiers(view), [view]);
  const sidebarTier =
    packageTiers.find((t) => t.key === activePackage) || packageTiers[1] || packageTiers[0];
  const features =
    view.pricingTiers?.[activePackage]?.features ||
    sidebarTier?.features ||
    ['Milestone delivery', 'Squad collaboration', 'File sharing'];

  return (
    <aside className="sq-pdv-rail">
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

      <div className="sq-pdv-packages ph-rail-package-card">
        <h4 className="sq-pdv-packages__title">Collaboration packages</h4>
        <div className="sq-pdv-packages__tabs">
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
        <div className="sq-pdv-packages__body">
          <div className="sq-pdv-packages__price ph-rail-package__head">
            <strong className="ph-rail-package__price-value">${sidebarTier?.price ?? 0}</strong>
            <span className="ph-rail-package__label">{sidebarTier?.label || 'Standard'} package</span>
          </div>
          <p className="sq-pdv-packages__meta ph-rail-package__meta">
            <FiClock size={12} aria-hidden /> {sidebarTier?.delivery} days ·{' '}
            {sidebarTier?.revisions} revisions
          </p>
          <ul className="ph-rail-package__features">
            {features.map((feature) => (
              <li key={feature}>
                <FiCheck size={12} aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
          <SquadProjectJoinPanel
            embedded
            onJoin={onJoinCollaborate}
            joining={joining}
            joinError={joinError}
            hasJoined={hasJoined}
            contributorCount={contributorCount}
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
    </aside>
  );
}
