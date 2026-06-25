import React from 'react';

const FilterPanelShell = ({ title, onReset, onApply, children, rightAction = null }) => {
  return (
    <div className="gigs-filter-panel">
      <div className="gigs-filter-panel-head">
        <h4>{title}</h4>
        {rightAction}
      </div>
      <div className="gigs-filter-panel-body">{children}</div>
      <div className="gigs-filter-panel-foot">
        <button type="button" className="gigs-panel-btn gigs-panel-btn-muted" onClick={onReset}>
          Reset
        </button>
        <button type="button" className="gigs-panel-btn gigs-panel-btn-primary" onClick={onApply}>
          Apply
        </button>
      </div>
    </div>
  );
};

export default FilterPanelShell;
