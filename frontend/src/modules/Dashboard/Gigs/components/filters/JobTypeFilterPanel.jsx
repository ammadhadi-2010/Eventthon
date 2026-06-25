import React, { useState } from 'react';
import FilterPanelShell from './FilterPanelShell';
import { saveBrowseFilters } from '../../utils/gigsBrowseSession';
import { JOBS_TYPE_OPTIONS } from './filterVariants';

const sellerLevels = [
  ['Top Rated', '1,486'],
  ['Level 2', '2,248'],
  ['Level 1', '1,902'],
  ['Rising Talent', '1,124'],
  ['New Seller', '742'],
];

const JobTypeFilterPanel = ({ onApplied, variant = 'gigs', onPersist }) => {
  const isJobs = variant === 'jobs';
  const [selected, setSelected] = useState('');
  const [multi, setMulti] = useState(['Top Rated']);

  const toggle = (name) => {
    if (isJobs) setSelected(name);
    else setMulti((prev) => (prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name]));
  };

  const rows = isJobs ? JOBS_TYPE_OPTIONS : sellerLevels;

  return (
    <FilterPanelShell
      title={isJobs ? 'Job Type' : 'Seller Level'}
      onReset={() => {
        if (isJobs) {
          onPersist?.({ jobType: '' });
          setSelected('');
        } else {
          saveBrowseFilters({ seller_levels: [] });
          setMulti([]);
        }
      }}
      onApply={() => {
        if (isJobs) onPersist?.({ jobType: selected || '' });
        else saveBrowseFilters({ seller_levels: multi });
        onApplied?.();
      }}
    >
      <div className="gigs-panel-list">
        {rows.map(([name, count]) => (
          <button key={name} type="button" className="gigs-option-row" onClick={() => toggle(name)}>
            <span
              className={
                isJobs
                  ? `gigs-radio ${selected === name ? 'is-active' : ''}`
                  : `gigs-check ${multi.includes(name) ? 'is-active' : ''}`
              }
            />
            <span className="gigs-option-label">{name}</span>
            <span className="gigs-option-count">{count}</span>
          </button>
        ))}
      </div>
    </FilterPanelShell>
  );
};

export default JobTypeFilterPanel;
