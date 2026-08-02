const EMPTY_APPLICATION_METRICS = {
  total: 0,
  segments: [
    { key: 'pending', label: 'Pending', count: 0, percent: 0 },
    { key: 'reviewing', label: 'Reviewing', count: 0, percent: 0 },
    { key: 'shortlisted', label: 'Shortlisted', count: 0, percent: 0 },
    { key: 'rejected', label: 'Rejected', count: 0, percent: 0 },
  ],
};

function normalizeCompany(company) {
  if (!company) return company;
  return {
    ...company,
    employees: company.employees ?? '—',
    openJobs: Number(company.openJobs || 0),
    totalApplications: Number(company.totalApplications || 0),
    hired: Number(company.hired || 0),
    followers: company.followers ?? 0,
    profileViews: Number(company.profileViews || 0),
    rating: company.rating == null || company.rating === '' ? null : company.rating,
  };
}

function isPipelineEmpty(pipeline) {
  const cols = pipeline?.columns;
  if (!Array.isArray(cols) || !cols.length) return true;
  return cols.every((col) => !Number(col?.count || 0) && !(col?.cards || []).length);
}

/** Normalize API dashboard payload — never inject demo/seed values. */
export function mergeCompanyDashboardData(apiData) {
  if (!apiData) return null;

  const metrics = apiData.applicationMetrics;
  const applicationMetrics =
    metrics && Array.isArray(metrics.segments) ? metrics : EMPTY_APPLICATION_METRICS;

  const talentPipeline = apiData.talentPipeline || { columns: [] };
  const analytics = apiData.analytics || {};

  return {
    ...apiData,
    company: normalizeCompany(apiData.company),
    recentApplications: Array.isArray(apiData.recentApplications) ? apiData.recentApplications : [],
    applicationMetrics,
    topSkills: Array.isArray(apiData.topSkills) ? apiData.topSkills : [],
    openJobs: Array.isArray(apiData.openJobs) ? apiData.openJobs : [],
    talentPipeline: isPipelineEmpty(talentPipeline) ? { columns: talentPipeline.columns || [] } : talentPipeline,
    analytics: {
      profileViews: Number(analytics.profileViews || 0),
      jobViews: Number(analytics.jobViews || 0),
      applications: Number(analytics.applications || 0),
      hires: Number(analytics.hires || 0),
      followersGrowth: Number(analytics.followersGrowth || 0),
      deltas: analytics.deltas || {},
      series: analytics.series || {},
    },
  };
}
