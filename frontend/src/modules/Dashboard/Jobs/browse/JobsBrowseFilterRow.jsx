import React, { useCallback, useRef, useState } from 'react';
import {
  CategoryFilterButton,
  ExperienceLevelFilterButton,
  JobTypeFilterButton,
  LocationFilterButton,
  SalaryRangeFilterButton,
  FiltersButton,
  CategoryFilterPanel,
  ExperienceLevelFilterPanel,
  JobTypeFilterPanel,
  LocationFilterPanel,
  SalaryRangeFilterPanel,
  AdvancedFiltersPanel,
} from '../../Gigs/components/filters';
import GigsFilterFloatingDrop from '../../Gigs/components/GigsFilterFloatingDrop';
import { loadJobsBrowseFilters, saveJobsBrowseFilters } from '../utils/jobsBrowseSession';

const panelProps = { variant: 'jobs' };

function JobsFilterPopover({ open, anchorRef, children }) {
  return (
    <>
      {open ? (
        <div className="gigs-filter-popover gigs-filter-popover--desktop">
          {children}
        </div>
      ) : null}
      <GigsFilterFloatingDrop open={open} anchorRef={anchorRef}>
        <div className="gigs-filter-popover gigs-filter-popover--mobile jobs-filter-floating-popover">
          {children}
        </div>
      </GigsFilterFloatingDrop>
    </>
  );
}

export default function JobsBrowseFilterRow({ setSearchFilters }) {
  const [activeFilter, setActiveFilter] = useState('');
  const categoryRef = useRef(null);
  const experienceRef = useRef(null);
  const jobTypeRef = useRef(null);
  const locationRef = useRef(null);
  const salaryRef = useRef(null);
  const filtersRef = useRef(null);

  const persistJobs = useCallback(
    (patch) => {
      const current = loadJobsBrowseFilters();
      const next = saveJobsBrowseFilters({ ...current, ...patch, q: current.q });
      setSearchFilters(next);
    },
    [setSearchFilters],
  );

  const closePanel = () => setActiveFilter('');
  const onApplied = () => closePanel();
  const shared = { ...panelProps, onPersist: persistJobs, onApplied };

  const toggle = (key) => setActiveFilter((prev) => (prev === key ? '' : key));

  const filters = [
    {
      key: 'category',
      ref: categoryRef,
      Button: CategoryFilterButton,
      Panel: CategoryFilterPanel,
      buttonProps: {},
    },
    {
      key: 'experience',
      ref: experienceRef,
      Button: ExperienceLevelFilterButton,
      Panel: ExperienceLevelFilterPanel,
      buttonProps: {},
    },
    {
      key: 'jobType',
      ref: jobTypeRef,
      Button: JobTypeFilterButton,
      Panel: JobTypeFilterPanel,
      buttonProps: {},
    },
    {
      key: 'location',
      ref: locationRef,
      Button: LocationFilterButton,
      Panel: LocationFilterPanel,
      buttonProps: {},
    },
    {
      key: 'salaryRange',
      ref: salaryRef,
      Button: SalaryRangeFilterButton,
      Panel: SalaryRangeFilterPanel,
      buttonProps: {},
    },
    {
      key: 'filters',
      ref: filtersRef,
      Button: FiltersButton,
      Panel: AdvancedFiltersPanel,
      buttonProps: { variant: 'jobs' },
    },
  ];

  return (
    <div className="gigs-filter-row jobs-filter-row">
      {filters.map(({ key, ref, Button, Panel, buttonProps }) => {
        const open = activeFilter === key;
        return (
          <div key={key} ref={ref} className="gigs-filter-pop-wrap">
            <Button isActive={open} onClick={() => toggle(key)} {...buttonProps} />
            <JobsFilterPopover open={open} anchorRef={ref}>
              <Panel {...shared} />
            </JobsFilterPopover>
          </div>
        );
      })}
    </div>
  );
}
