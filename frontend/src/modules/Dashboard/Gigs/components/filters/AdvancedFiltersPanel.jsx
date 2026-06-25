import React, { useState } from 'react';
import FilterPanelShell from './FilterPanelShell';
import { saveBrowseFilters } from '../../utils/gigsBrowseSession';

const AdvancedFiltersPanel = ({ onApplied, variant = 'gigs', onPersist }) => {
  const isJobs = variant === 'jobs';
  const [remoteType, setRemoteType] = useState('Any');
  const [sortLabel, setSortLabel] = useState('Best Match');

  const clearAll = () => {
    if (isJobs) {
      onPersist?.({
        category: '',
        experienceLevel: '',
        jobType: '',
        location: '',
        workMode: '',
        salaryMin: null,
        salaryMax: null,
      });
    } else {
      saveBrowseFilters({ sort_label: 'Best Match' });
    }
    setSortLabel('Best Match');
    setRemoteType('Any');
  };

  return (
    <FilterPanelShell
      title={isJobs ? 'Filters' : `Sort by: ${sortLabel}`}
      onReset={clearAll}
      onApply={() => {
        if (isJobs) onPersist?.({ workMode: remoteType === 'Any' ? '' : remoteType });
        else saveBrowseFilters({ sort_label: sortLabel });
        onApplied?.();
      }}
      rightAction={
        <button type="button" className="gigs-clear-btn" onClick={clearAll}>
          Clear All
        </button>
      }
    >
      {isJobs ? (
        <div className="gigs-advanced-field">
          <label>Work Mode</label>
          {['Any', 'Remote', 'Hybrid', 'On-site'].map((item) => (
            <button key={item} type="button" className="gigs-option-row" onClick={() => setRemoteType(item)}>
              <span className={`gigs-radio ${remoteType === item ? 'is-active' : ''}`} />
              <span className="gigs-option-label">{item}</span>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="gigs-advanced-field">
            <label>Sort Preference</label>
            <select value={sortLabel} onChange={(event) => setSortLabel(event.target.value)}>
              <option>Best Match</option>
              <option>Newest First</option>
              <option>Top Rated Seller</option>
              <option>Most Reviewed</option>
              <option>Fastest Delivery</option>
            </select>
          </div>
          <div className="gigs-advanced-field">
            <label>Seller Availability</label>
            {['Any', 'Available Now', 'Within 24 Hours', 'This Week'].map((item) => (
              <button key={item} type="button" className="gigs-option-row" onClick={() => setRemoteType(item)}>
                <span className={`gigs-radio ${remoteType === item ? 'is-active' : ''}`} />
                <span className="gigs-option-label">{item}</span>
              </button>
            ))}
          </div>
          <div className="gigs-advanced-field">
            <label>Seller Language</label>
            <select defaultValue="Any">
              <option>Any</option>
              <option>English</option>
              <option>Urdu</option>
              <option>Arabic</option>
            </select>
          </div>
        </>
      )}
    </FilterPanelShell>
  );
};

export default AdvancedFiltersPanel;
