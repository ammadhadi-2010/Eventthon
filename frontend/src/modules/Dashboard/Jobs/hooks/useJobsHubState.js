import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyToJob,
  registerJobApplication,
  createJobAlert,
  fetchJobAlerts,
  fetchJobApplications,
  fetchJobsHubMetrics,
  fetchRecommendedJobs,
  fetchSavedJobs,
  patchJobAlert,
  searchHubJobs,
  updateJobApplicationFlow,
  uploadJobResume,
} from '../services/jobsHubApi';
import { JOB_ALERTS_LIST } from '../data/jobAlertsData';
import { RECOMMENDED_JOBS } from '../data/recommendedJobsData';
import { EMPTY_JOBS_FILTERS, loadJobsBrowseFilters } from '../utils/jobsBrowseSession';
import { toJobSnapshot } from '../utils/jobSnapshot';
import { mergeHubJobsWithDemo } from '../utils/mergeDemoJobs';
import { resolveJobsUserId } from '../utils/jobsUser';
import { runSavedJobToggle } from './runSavedJobToggle';

export function useJobsHubState() {
  const [metrics, setMetrics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [jobListings, setJobListings] = useState([]);
  const [searchStats, setSearchStats] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [searchFilters, setSearchFilters] = useState(() => loadJobsBrowseFilters());
  const [listingsLoading, setListingsLoading] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshHub = useCallback(async () => {
    setLoading(true);
    try {
      const [metricsRes, apps, alertRows, savedRows, recRows] = await Promise.all([
        fetchJobsHubMetrics(),
        fetchJobApplications('all'),
        fetchJobAlerts(),
        fetchSavedJobs(),
        fetchRecommendedJobs(),
      ]);
      setMetrics(metricsRes);
      setApplications(apps);
      setAlerts(alertRows.length ? alertRows : JOB_ALERTS_LIST);
      setSavedJobs(Array.isArray(savedRows) ? savedRows : []);
      setRecommendedJobs(
        Array.isArray(recRows) && recRows.length ? recRows : RECOMMENDED_JOBS,
      );
    } catch {
      setAlerts(JOB_ALERTS_LIST);
      setSavedJobs([]);
      setRecommendedJobs(RECOMMENDED_JOBS);
    } finally {
      setLoading(false);
    }
  }, []);

  const runJobSearch = useCallback(async (filters = searchFilters) => {
    setListingsLoading(true);
    try {
      const result = await searchHubJobs(filters);
      const rows = result?.rows || [];
      setJobListings(mergeHubJobsWithDemo(Array.isArray(rows) ? rows : []));
      setSearchStats(Array.isArray(result?.stats) ? result.stats : []);
    } catch {
      setJobListings(mergeHubJobsWithDemo([]));
      setSearchStats([]);
    } finally {
      setListingsLoading(false);
    }
  }, [searchFilters]);

  useEffect(() => {
    refreshHub();
  }, [refreshHub]);

  useEffect(() => {
    runJobSearch(searchFilters);
  }, [searchFilters, runJobSearch]);

  const savedJobIds = useMemo(() => {
    const ids = new Set();
    savedJobs.forEach((row) => {
      if (row.id) ids.add(row.id);
      if (row.jobId) ids.add(row.jobId);
    });
    return ids;
  }, [savedJobs]);

  const menuCounts = useMemo(() => {
    const base = metrics?.menuCounts || {};
    return { ...base, saved: base.saved ?? savedJobs.length, applications: base.applications ?? applications.length };
  }, [metrics, savedJobs.length, applications.length]);

  const selectedApplication = useMemo(
    () => applications.find((row) => row.id === selectedApplicationId) || null,
    [applications, selectedApplicationId],
  );

  const addAlert = useCallback(async (form) => {
    try {
      const created = await createJobAlert(form);
      if (created) setAlerts((prev) => [created, ...prev]);
      await refreshHub();
      await runJobSearch(searchFilters);
      return created;
    } catch {
      return null;
    }
  }, [refreshHub, runJobSearch, searchFilters]);

  const toggleAlertEmail = useCallback(async (id, enabled) => {
    setAlerts((prev) => prev.map((row) => (row.id === id ? { ...row, emailEnabled: enabled } : row)));
    try {
      await patchJobAlert(id, { email_enabled: enabled });
    } catch {
      /* optimistic */
    }
  }, []);

  const toggleSavedJob = useCallback(
    (job) =>
      runSavedJobToggle(job, {
        savedJobIds,
        savedJobs,
        metrics,
        setSavedJobs,
        setMetrics,
      }),
    [savedJobIds, savedJobs, metrics],
  );

  const bumpApplicationCount = useCallback((count) => {
    setMetrics((prev) => ({
      ...prev,
      menuCounts: {
        ...(prev?.menuCounts || {}),
        applications: count ?? (prev?.menuCounts?.applications || 0) + 1,
      },
    }));
  }, []);

  const quickApplyToJob = useCallback(async (job) => {
    const uid = resolveJobsUserId();
    if (!uid || uid.length < 2) {
      const err = new Error('Sign in with your mobile or email to apply.');
      err.code = 'AUTH_REQUIRED';
      throw err;
    }
    const jobId = job?.id || job?.jobId;
    if (!jobId) return null;
    try {
      const res = await registerJobApplication(jobId, toJobSnapshot(job));
      const created = res?.data;
      if (created) {
        setApplications((prev) => [created, ...prev.filter((row) => row.jobId !== jobId)]);
        if (created.id) setSelectedApplicationId(created.id);
        if (res?.menuCounts?.applications != null) {
          bumpApplicationCount(res.menuCounts.applications);
        } else {
          bumpApplicationCount();
        }
      }
      return created;
    } catch (err) {
      if (err?.response?.status === 409) throw err;
      return null;
    }
  }, [bumpApplicationCount]);

  const submitApplication = useCallback(async (job, resumeFile) => {
    const uid = resolveJobsUserId();
    if (!uid || uid.length < 2) {
      const err = new Error('Sign in with your mobile or email to apply.');
      err.code = 'AUTH_REQUIRED';
      throw err;
    }
    const jobId = job?.id || job?.jobId;
    if (!jobId || !resumeFile) return null;
    try {
      const resumeUrl = await uploadJobResume(resumeFile);
      const created = await applyToJob(jobId, resumeUrl, toJobSnapshot(job));
      if (created) {
        setApplications((prev) => [created, ...prev.filter((row) => row.jobId !== jobId)]);
        bumpApplicationCount();
      }
      return created;
    } catch (err) {
      if (err?.response?.status === 409) throw err;
      return null;
    }
  }, [bumpApplicationCount]);

  const advanceApplication = useCallback(async (applicationId, status, recruiterAction) => {
    try {
      const updated = await updateJobApplicationFlow(applicationId, status, recruiterAction);
      if (updated) setApplications((prev) => prev.map((row) => (row.id === applicationId ? updated : row)));
      return updated;
    } catch {
      return null;
    }
  }, []);

  return {
    metrics,
    applications,
    alerts,
    savedJobs,
    savedJobIds,
    jobListings,
    searchStats,
    recommendedJobs,
    searchFilters,
    setSearchFilters,
    listingsLoading,
    loading,
    menuCounts,
    boardStats: metrics?.stats || null,
    selectedApplication,
    selectedApplicationId,
    setSelectedApplicationId,
    refreshHub,
    runJobSearch,
    addAlert,
    toggleAlertEmail,
    toggleSavedJob,
    quickApplyToJob,
    submitApplication,
    advanceApplication,
  };
}
