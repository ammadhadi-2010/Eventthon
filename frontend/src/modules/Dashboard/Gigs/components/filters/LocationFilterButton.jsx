import React from 'react';
import FilterButtonBase from './FilterButtonBase';

const BudgetFilterButton = ({ isActive, onClick }) => {
  return <FilterButtonBase label="Budget" isActive={isActive} onClick={onClick} />;
};

export default BudgetFilterButton;
