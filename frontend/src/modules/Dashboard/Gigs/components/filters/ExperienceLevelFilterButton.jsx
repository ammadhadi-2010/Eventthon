import React from 'react';
import FilterButtonBase from './FilterButtonBase';

const ExperienceLevelFilterButton = ({ isActive, onClick }) => {
  return <FilterButtonBase label="Service Options" isActive={isActive} onClick={onClick} />;
};

export default ExperienceLevelFilterButton;
