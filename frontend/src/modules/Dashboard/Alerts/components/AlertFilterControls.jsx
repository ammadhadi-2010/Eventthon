import React from "react";

const alertTypes = [
  "All Types",
  "Mentions",
  "Squad Alerts",
  "Project Updates",
  "System Alerts",
  "Job Alerts",
  "Security Alerts",
];

const priorities = ["All Priorities", "High", "Medium", "Low"];

const AlertFilterControls = ({
  selectedTypes = [],
  selectedPriorities = [],
  onToggleType,
  onTogglePriority,
  onApplyFilters,
  onClearFilters,
}) => (
  <>
    <div className="alerts-filter-head">
      <h4>Filter Alerts</h4>
      <button type="button" onClick={onClearFilters}>
        Clear all
      </button>
    </div>

    <div className="alerts-filter-group">
      <p>Alert Type</p>
      {alertTypes.map((type, index) => (
        <label key={type} className="alerts-checkbox">
          <input
            type="checkbox"
            checked={index === 0 ? selectedTypes.length === 0 : selectedTypes.includes(type)}
            onChange={() => onToggleType?.(type)}
          />
          <span>{type}</span>
        </label>
      ))}
    </div>

    <div className="alerts-filter-group">
      <p>Priority</p>
      {priorities.map((priority, index) => (
        <label key={priority} className="alerts-checkbox">
          <input
            type="checkbox"
            checked={
              index === 0 ? selectedPriorities.length === 0 : selectedPriorities.includes(priority)
            }
            onChange={() => onTogglePriority?.(priority)}
          />
          <span>{priority}</span>
        </label>
      ))}
    </div>

    <button type="button" className="alerts-apply-btn" onClick={onApplyFilters}>
      Apply filters
    </button>
  </>
);

export default AlertFilterControls;
