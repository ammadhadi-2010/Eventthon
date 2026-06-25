import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

export default function MilestonesProjectFilter({ value, options, onChange }) {
  return (
    <div className="ph-ms-filter-wrap">
      <select
        className="ph-ms-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter by project"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
      <FiChevronDown size={14} className="ph-ms-filter-ico" aria-hidden />
    </div>
  );
}
