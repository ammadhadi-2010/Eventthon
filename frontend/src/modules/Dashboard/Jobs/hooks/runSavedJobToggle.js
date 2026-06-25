import { saveJob, unsaveJob } from '../services/jobsHubApi';
import { toJobSnapshot } from '../utils/jobSnapshot';
import {
  filterOutJobId,
  jobToOptimisticSavedRow,
  patchSavedMenuCount,
} from '../utils/savedJobOptimistic';
import { resolveJobsUserId } from '../utils/jobsUser';

/**
 * Optimistic save/unsave with MongoDB sync and live menuCounts.saved updates.
 */
export async function runSavedJobToggle(job, { savedJobIds, savedJobs, metrics, setSavedJobs, setMetrics }) {
  const jobId = job?.id || job?.jobId;
  if (!jobId) return null;

  const uid = resolveJobsUserId();
  if (!uid || uid.length < 2) {
    console.warn('Sign in with your mobile or email to save jobs.');
    return null;
  }

  const wasSaved = savedJobIds.has(jobId);
  const jobsBefore = savedJobs;
  const countBefore = metrics?.menuCounts?.saved ?? savedJobs.length;

  if (wasSaved) {
    setSavedJobs((prev) => filterOutJobId(prev, jobId));
    setMetrics((prev) => patchSavedMenuCount(prev, Math.max(0, countBefore - 1)));
  } else {
    const optimistic = jobToOptimisticSavedRow(job);
    if (optimistic) {
      setSavedJobs((prev) => [optimistic, ...filterOutJobId(prev, jobId)]);
    }
    setMetrics((prev) => patchSavedMenuCount(prev, countBefore + 1));
  }

  try {
    const res = wasSaved
      ? await unsaveJob(jobId)
      : await saveJob(jobId, toJobSnapshot(job));

    if (res.saved && res.data) {
      setSavedJobs((prev) => [res.data, ...filterOutJobId(prev, jobId)]);
    } else if (!res.saved) {
      setSavedJobs((prev) => filterOutJobId(prev, jobId));
    }
    if (res.menuCounts?.saved != null) {
      setMetrics((prev) => patchSavedMenuCount(prev, res.menuCounts.saved));
    }
    return res;
  } catch (err) {
    console.warn('Saved job toggle failed:', err?.response?.data?.detail || err?.message);
    setSavedJobs(jobsBefore);
    setMetrics((prev) => patchSavedMenuCount(prev, countBefore));
    return null;
  }
}
