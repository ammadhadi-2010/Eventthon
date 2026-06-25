/** Optimistic row for saved-jobs list before API round-trip. */
export function jobToOptimisticSavedRow(job) {
  const jobId = job?.id || job?.jobId;
  if (!jobId) return null;
  const company = job?.company || 'Company';
  return {
    id: jobId,
    jobId,
    role: job?.role || 'Role',
    company,
    salary: job?.salary || 'Competitive',
    type: job?.type || 'Full-time',
    location: job?.location || 'Remote',
    savedOn: 'Just now',
    logoText: job?.logoText || (company.slice(0, 1).toUpperCase() || 'J'),
    logoClass: job?.logoClass || 'google',
    tags: job?.tags || [],
  };
}

export function filterOutJobId(rows, jobId) {
  return (rows || []).filter((row) => row.id !== jobId && row.jobId !== jobId);
}

export function patchSavedMenuCount(metrics, savedTotal) {
  return {
    ...metrics,
    menuCounts: { ...(metrics?.menuCounts || {}), saved: savedTotal },
  };
}
