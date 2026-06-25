import React from 'react';
import { FiFilter } from 'react-icons/fi';
import FilterButtonBase from './FilterButtonBase';

const FiltersButton = ({ isActive, onClick, variant = 'gigs' }) => {
  return (
    <FilterButtonBase
      label={variant === 'jobs' ? 'Filters' : 'Sort by: Best Match'}
      isActive={isActive}
      onClick={onClick}
      icon={<FiFilter size={13} />}
      showChevron={false}
      strong
    />
  );
};

export default FiltersButton;
