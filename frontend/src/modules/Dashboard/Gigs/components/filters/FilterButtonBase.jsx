import React from 'react';

const FilterButtonBase = ({ label, isActive, onClick, icon = null, showChevron = true, strong = false }) => {
  const className = `gigs-filter-btn${strong ? ' gigs-filter-btn-strong' : ''}${isActive ? ' is-active' : ''}`;

  return (
    <button type="button" className={className} onClick={onClick}>
      {icon}
      {label}
      {showChevron ? <span className="gigs-filter-chevron">v</span> : null}
    </button>
  );
};

export default FilterButtonBase;
