import React, { useState } from 'react';
import FilterPanelShell from './FilterPanelShell';
import { GLOBAL_SERVICE_CATEGORY_OPTIONS } from '../../../../../data/globalCategories';
import { saveBrowseFilters } from '../../utils/gigsBrowseSession';
import JobsCategoryPicker from './JobsCategoryPicker';

const categoryOptions = GLOBAL_SERVICE_CATEGORY_OPTIONS.map((item, index) => ({
  ...item,
  count: String(180 + index * 37),
}));

const CategoryFilterPanel = ({ onApplied, variant = 'gigs', onPersist }) => {
  const isJobs = variant === 'jobs';
  const [selected, setSelected] = useState(isJobs ? '' : 'Web Development');

  if (isJobs) {
    return (
      <FilterPanelShell
        title="Category"
        onReset={() => {
          onPersist?.({ category: '' });
          setSelected('');
        }}
        onApply={() => {
          onPersist?.({ category: selected || '' });
          onApplied?.();
        }}
      >
        <JobsCategoryPicker value={selected} onChange={setSelected} />
      </FilterPanelShell>
    );
  }

  return (
    <FilterPanelShell
      title="Category"
      onReset={() => {
        saveBrowseFilters({ category: '' });
        setSelected('');
      }}
      onApply={() => {
        if (selected) saveBrowseFilters({ category: selected });
        else saveBrowseFilters({ category: '' });
        onApplied?.();
      }}
    >
      <JobsCategoryPicker value={selected} onChange={setSelected} items={categoryOptions} />
    </FilterPanelShell>
  );
};

export default CategoryFilterPanel;
export { JobsCategoryPicker };
