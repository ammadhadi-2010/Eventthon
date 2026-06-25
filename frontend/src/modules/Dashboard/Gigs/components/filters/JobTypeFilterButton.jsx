import React from 'react';
import FilterButtonBase from './FilterButtonBase';

const JobTypeFilterButton = ({ isActive, onClick }) => {
  return <FilterButtonBase label="Seller Level" isActive={isActive} onClick={onClick} />;
};

export default JobTypeFilterButton;
