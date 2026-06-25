import React, { useState } from 'react';
import ProjectsViewHeader from '../components/shared/ProjectsViewHeader';
import ReportsTabs from '../components/reports/ReportsTabs';
import ReportsTabContent from '../components/reports/ReportsTabContent';
import useReportsHubApi from '../hooks/useReportsHubApi';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview');
  const reports = useReportsHubApi();

  return (
    <div className="ph-center-stack ph-reports">
      <ProjectsViewHeader title="Reports" subtitle="Analytics and insights about your projects." />
      {reports.error ? <p className="ph-api-banner">{reports.error}</p> : null}
      {reports.loading ? <p className="ph-rpt-loading">Loading reports…</p> : null}
      <ReportsTabs activeTab={activeTab} onChange={setActiveTab} />
      <ReportsTabContent activeTab={activeTab} reports={reports} />
    </div>
  );
}
