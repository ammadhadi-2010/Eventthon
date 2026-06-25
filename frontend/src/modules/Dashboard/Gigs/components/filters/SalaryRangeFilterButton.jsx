import React from 'react';
import FilterButtonBase from './FilterButtonBase';

const SalaryRangeFilterButton = ({ isActive, onClick }) => {
  return <FilterButtonBase label="Delivery Time" isActive={isActive} onClick={onClick} />;
};

export default SalaryRangeFilterButton;
