const EMPTY_APPLICATION_METRICS = {
  total: 0,
  segments: [
    { key: 'pending', label: 'Pending', count: 0, percent: 0 },
    { key: 'reviewing', label: 'Reviewing', count: 0, percent: 0 },
    { key: 'shortlisted', label: 'Shortlisted', count: 0, percent: 0 },
    { key: 'rejected', label: 'Rejected', count: 0, percent: 0 },
  ],
};

export function mergeCompanyDashboardData(apiData) {
  if (!apiData) return null;

  const metrics = apiData.applicationMetrics;
  const applicationMetrics =
    metrics && Array.isArray(metrics.segments) ? metrics : EMPTY_APPLICATION_METRICS;

  return {
    ...apiData,
    recentApplications: Array.isArray(apiData.recentApplications) ? apiData.recentApplications : [],
    applicationMetrics,
    topSkills: Array.isArray(apiData.topSkills) ? apiData.topSkills : [],
    openJobs: Array.isArray(apiData.openJobs) ? apiData.openJobs : [],
  };
}
