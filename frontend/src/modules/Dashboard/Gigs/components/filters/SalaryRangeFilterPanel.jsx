import React, { useState } from 'react';
import FilterPanelShell from './FilterPanelShell';
import { saveBrowseFilters } from '../../utils/gigsBrowseSession';
import { JOBS_SALARY_OPTIONS } from './filterVariants';

const deliveryRanges = ['Any', 'Within 24 Hours', 'Up to 3 Days', 'Up to 5 Days', 'Up to 7 Days', 'Up to 14 Days', 'Custom'];

const SalaryRangeFilterPanel = ({ onApplied, variant = 'gigs', onPersist }) => {
  const isJobs = variant === 'jobs';
  const [selected, setSelected] = useState(isJobs ? 'Any salary' : 'Any');

  return (
    <FilterPanelShell
      title={isJobs ? 'Salary Range' : 'Delivery Time'}
      onReset={() => {
        if (isJobs) {
          onPersist?.({ salaryMin: null, salaryMax: null });
          setSelected('Any salary');
        } else {
          saveBrowseFilters({ delivery_label: 'Any' });
          setSelected('Any');
        }
      }}
      onApply={() => {
        if (isJobs) {
          const band = JOBS_SALARY_OPTIONS.find(([label]) => label === selected) || JOBS_SALARY_OPTIONS[0];
          onPersist?.({ salaryMin: band[1], salaryMax: band[2] });
        } else {
          saveBrowseFilters({ delivery_label: selected });
        }
        onApplied?.();
      }}
    >
      <div className="gigs-panel-list">
        {(isJobs ? JOBS_SALARY_OPTIONS : deliveryRanges.map((r) => [r])).map((row) => {
          const label = isJobs ? row[0] : row[0];
          return (
            <button key={label} type="button" className="gigs-option-row" onClick={() => setSelected(label)}>
              <span className={`gigs-radio ${selected === label ? 'is-active' : ''}`} />
              <span className="gigs-option-label">{label}</span>
            </button>
          );
        })}
      </div>
      {!isJobs ? (
        <>
          <div className="gigs-salary-slider" aria-hidden="true">
            <div className="gigs-salary-track" />
            <div className="gigs-salary-range" />
            <span className="gigs-salary-dot left" />
            <span className="gigs-salary-dot right" />
          </div>
          <p className="gigs-salary-label">Within 24 Hours - Up to 7 Days</p>
        </>
      ) : (
        <p className="gigs-salary-label">Annual compensation band (USD, thousands)</p>
      )}
    </FilterPanelShell>
  );
};

export default SalaryRangeFilterPanel;
