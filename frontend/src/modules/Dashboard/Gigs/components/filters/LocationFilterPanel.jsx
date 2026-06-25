import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import FilterPanelShell from './FilterPanelShell';
import { saveBrowseFilters } from '../../utils/gigsBrowseSession';
import { JOBS_LOCATION_OPTIONS } from './filterVariants';

const budgetRows = [
  ['Under $50', '2,451'],
  ['$50 - $150', '2,084'],
  ['$150 - $300', '1,532'],
  ['$300 - $600', '921'],
  ['$600 - $1000', '512'],
  ['$1000+', '264'],
];

const LocationFilterPanel = ({ onApplied, variant = 'gigs', onPersist }) => {
  const isJobs = variant === 'jobs';
  const [selected, setSelected] = useState(isJobs ? '' : ['$50 - $150']);
  const [multi, setMulti] = useState(isJobs ? [] : ['$50 - $150']);

  const pick = (name) => {
    if (isJobs) setSelected(name);
    else setMulti((prev) => (prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name]));
  };

  const rows = isJobs ? JOBS_LOCATION_OPTIONS : budgetRows;

  return (
    <FilterPanelShell
      title={isJobs ? 'Location' : 'Budget'}
      onReset={() => {
        if (isJobs) {
          onPersist?.({ location: '', workMode: '' });
          setSelected('');
        } else {
          saveBrowseFilters({ budget_buckets: [] });
          setMulti([]);
        }
      }}
      onApply={() => {
        if (isJobs) {
          const remote = ['Remote', 'Hybrid', 'On-site'].includes(selected);
          onPersist?.({
            location: remote ? '' : selected,
            workMode: remote ? selected : '',
          });
        } else {
          saveBrowseFilters({ budget_buckets: multi });
        }
        onApplied?.();
      }}
    >
      {!isJobs ? (
        <div className="gigs-panel-search">
          <FiSearch size={12} />
          <input type="text" placeholder="Search budget..." />
        </div>
      ) : null}
      <div className="gigs-panel-list">
        {rows.map(([name, count]) => (
          <button key={name} type="button" className="gigs-option-row" onClick={() => pick(name)}>
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

export default LocationFilterPanel;
