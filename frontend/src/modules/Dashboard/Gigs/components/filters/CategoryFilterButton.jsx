import React from 'react';
import FilterButtonBase from './FilterButtonBase';

const CategoryFilterButton = ({ isActive, onClick, label = 'Category' }) => {
  return <FilterButtonBase label={label} isActive={isActive} onClick={onClick} />;
};

export default CategoryFilterButton;
