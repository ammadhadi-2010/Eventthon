import React from 'react';
import { REPORTS_SUMMARY } from '../../data/reportsData';
import ReportsKpiRow from './ReportsKpiRow';
import ProjectsProgressDonut from './ProjectsProgressDonut';
import ActivityOverviewChart from './ActivityOverviewChart';

export default function ReportsOverviewPanel({ reports }) {
  const kpis = reports?.overview?.kpis || REPORTS_SUMMARY;
  const slices = reports?.overview?.progress_slices;

  return (
    <>
      <ReportsKpiRow items={kpis} ariaLabel="Project summary" />
      <div className="ph-rpt-charts-row">
        <ProjectsProgressDonut slices={slices} />
        <ActivityOverviewChart />
      </div>
    </>
  );
}
