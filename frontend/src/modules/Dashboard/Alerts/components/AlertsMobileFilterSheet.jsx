import React from "react";
import { X } from "lucide-react";
import AlertFilterControls from "./AlertFilterControls";

const AlertsMobileFilterSheet = ({
  open,
  onClose,
  selectedTypes,
  selectedPriorities,
  onToggleType,
  onTogglePriority,
  onApplyFilters,
  onClearFilters,
}) => {
  if (!open) return null;

  const apply = () => {
    onApplyFilters?.();
    onClose?.();
  };

  return (
    <>
      <button type="button" className="alerts-filter-sheet-backdrop" aria-label="Close filters" onClick={onClose} />
      <section className="alerts-filter-sheet" aria-label="Filter alerts">
        <div className="alerts-filter-sheet__head">
          <h3>Filter Alerts</h3>
          <button type="button" className="alerts-filter-sheet__close" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="alerts-filter-sheet__body alerts-panel-card">
          <AlertFilterControls
            selectedTypes={selectedTypes}
            selectedPriorities={selectedPriorities}
            onToggleType={onToggleType}
            onTogglePriority={onTogglePriority}
            onApplyFilters={apply}
            onClearFilters={onClearFilters}
          />
        </div>
      </section>
    </>
  );
};

export default AlertsMobileFilterSheet;
