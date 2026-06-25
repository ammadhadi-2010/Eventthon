import { DEMO_JOB_LISTINGS } from '../data/demoJobsData';

/** Use live API listings when present; demo cards only when the database returns none. */
export function mergeHubJobsWithDemo(apiRows = []) {
  const live = (Array.isArray(apiRows) ? apiRows : []).filter((row) => row?.id || row?.jobId);
  if (live.length > 0) return live;
  return [...DEMO_JOB_LISTINGS];
}
