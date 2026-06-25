import React from 'react';
import { parseSalaryBand } from './jobShowroomUtils';

export default function JobSalaryGauge({ data }) {
  const band = parseSalaryBand(data);
  const span = Math.max(band.max - band.min, 10);
  const left = Math.max(8, Math.min(40, band.min / 3));
  const width = Math.min(72, (span / 200) * 100);

  return (
    <div className="ps-mp-salary-gauge" aria-label="Salary range gauge">
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem' }}>Salary Range</h3>
      <div className="ps-mp-salary-track">
        <div className="ps-mp-salary-fill" style={{ left: `${left}%`, width: `${width}%` }} />
      </div>
      <div className="ps-mp-salary-labels">
        <span>${band.min}k</span>
        <span>{band.label}</span>
        <span>${band.max}k</span>
      </div>
    </div>
  );
}
