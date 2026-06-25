import React, { useState } from 'react';
import FilterPanelShell from './FilterPanelShell';
import { saveBrowseFilters } from '../../utils/gigsBrowseSession';
import { JOBS_EXPERIENCE_OPTIONS } from './filterVariants';

const gigLevels = [
  ['Logo Design', 'Brand identity packages', '1,248'],
  ['Web Development', 'Frontend and backend solutions', '2,106'],
  ['Video Editing', 'Short-form and long-form edits', '1,432'],
  ['Content Writing', 'SEO blogs and web copy', '1,024'],
  ['Digital Marketing', 'Ads and growth campaigns', '892'],
];

const ExperienceLevelFilterPanel = ({ onApplied, variant = 'gigs', onPersist }) => {
  const isJobs = variant === 'jobs';
  const levels = isJobs ? JOBS_EXPERIENCE_OPTIONS : gigLevels;
  const [selected, setSelected] = useState(isJobs ? '' : 'Web Development');

  const apply = () => {
    if (isJobs) {
      onPersist?.({ experienceLevel: selected || '' });
    } else if (selected) {
      saveBrowseFilters({ service_focus: selected });
    } else {
      saveBrowseFilters({ service_focus: '' });
    }
    onApplied?.();
  };

  return (
    <FilterPanelShell
      title={isJobs ? 'Experience Level' : 'Service Options'}
      onReset={() => {
        if (isJobs) onPersist?.({ experienceLevel: '' });
        else saveBrowseFilters({ service_focus: '' });
        setSelected('');
      }}
      onApply={apply}
    >
      <div className="gigs-panel-list">
        {levels.map(([title, sub, count]) => (
          <button key={title} type="button" className="gigs-option-row gigs-option-row-multi" onClick={() => setSelected(title)}>
            <span className={`gigs-radio ${selected === title ? 'is-active' : ''}`} />
            <span>
              <span className="gigs-option-label">{title}</span>
              <span className="gigs-option-sub">{sub}</span>
            </span>
            <span className="gigs-option-count">{count}</span>
          </button>
        ))}
      </div>
    </FilterPanelShell>
  );
};

export default ExperienceLevelFilterPanel;
