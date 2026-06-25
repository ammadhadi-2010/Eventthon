import API from '../../../../api/axiosConfig';
import { buildJobsAuthHeaders, resolveJobsUserId } from '../utils/jobsUser';

function resolveUserId() {
  return resolveJobsUserId();
}

function userQuery(extra = {}) {
  const user_id = resolveUserId();
  const params = new URLSearchParams();
  if (user_id) params.set('user_id', user_id);
  Object.entries(extra).forEach(([k, v]) => {
    if (v !== '' && v != null) params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/** Browse/search listing params — no auth user_id required. */
function listingQuery(extra = {}) {
  const params = new URLSearchParams();
  Object.entries(extra).forEach(([k, v]) => {
    if (v !== '' && v != null) params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchJobsHubMetrics() {
  const res = await API.get(`/api/jobs/hub/metrics${userQuery()}`);
  return res?.data || {};
}

export async function fetchJobsSidebarAnalytics() {
  const res = await API.get(`/api/jobs/hub/sidebar-analytics${userQuery()}`);
  return {
    market: res?.data?.market || null,
    activity: res?.data?.activity || [],
  };
}

export async function fetchJobApplications(status = 'all') {
  const extra = status && status !== 'all' ? { status } : {};
  const res = await API.get(`/api/jobs/hub/applications${userQuery(extra)}`);
  return res?.data?.data || [];
}

export async function updateJobApplicationFlow(applicationId, status, recruiterAction) {
  const res = await API.patch(`/api/jobs/hub/applications/${applicationId}/flow`, {
    status,
    recruiter_action: recruiterAction || null,
  });
  return res?.data?.data;
}

export async function uploadJobResume(file) {
  const form = new FormData();
  form.append('user_id', resolveUserId());
  form.append('file', file);
  const res = await API.post('/api/jobs/hub/applications/resume', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res?.data?.resume_url || '';
}

export async function registerJobApplication(jobId, jobSnapshot = null) {
  const res = await API.post(
    '/api/jobs/apply',
    {
      user_identifier: resolveUserId(),
      job_id: jobId,
      timestamp: new Date().toISOString(),
      status: 'applied',
      job_snapshot: jobSnapshot,
    },
    { headers: buildJobsAuthHeaders() },
  );
  return res?.data || {};
}

export async function applyToJob(jobId, resumeUrl, jobSnapshot = null) {
  const res = await API.post(
    '/api/jobs/apply/resume',
    {
      user_id: resolveUserId(),
      job_id: jobId,
      resume_url: resumeUrl,
      job_snapshot: jobSnapshot,
    },
    { headers: buildJobsAuthHeaders() },
  );
  return res?.data?.data;
}

export async function searchHubJobs(filters = {}) {
  const extra = {
    q: filters.q || '',
    category: filters.category || '',
    experience_level: filters.experienceLevel || '',
    job_type: filters.jobType || '',
    location: filters.location || '',
    work_mode: filters.workMode || '',
  };
  if (filters.salaryMin != null && filters.salaryMin !== '') extra.salary_min = filters.salaryMin;
  if (filters.salaryMax != null && filters.salaryMax !== '') extra.salary_max = filters.salaryMax;
  const res = await API.get(`/api/jobs/search${listingQuery(extra)}`);
  return {
    rows: res?.data?.data || [],
    stats: res?.data?.stats || [],
  };
}

export async function fetchRecommendedJobs() {
  const res = await API.get(`/api/jobs/hub/recommended${userQuery()}`);
  return res?.data?.data || [];
}

export async function fetchJobAlerts() {
  const res = await API.get(`/api/jobs/hub/alerts${userQuery()}`);
  return res?.data?.data || [];
}

export async function createJobAlert(form) {
  const res = await API.post('/api/jobs/hub/alerts', {
    user_id: resolveUserId(),
    job_title: form.jobTitle,
    job_description: form.jobDescription,
    employment_type: form.employmentType,
    experience_level: form.experienceLevel,
    career_level: form.careerLevel,
    job_category: form.jobCategory,
    salary_min: form.salaryMin,
    salary_max: form.salaryMax,
    work_mode: form.workMode,
    skills: form.skills,
    keywords: form.keywords,
    email_notifications: form.emailNotifications,
    notification_email: form.notificationEmail,
  });
  return res?.data?.data;
}

export async function patchJobAlert(alertId, payload) {
  const res = await API.patch(`/api/jobs/hub/alerts/${alertId}`, payload);
  return res?.data?.data;
}

export async function fetchSavedJobs() {
  const res = await API.get(`/api/jobs/hub/saved${userQuery()}`);
  return res?.data?.data || [];
}

export async function saveJob(jobId, jobSnapshot = null) {
  const res = await API.post('/api/jobs/hub/saved', {
    user_identifier: resolveUserId(),
    job_id: jobId,
    job_snapshot: jobSnapshot,
  });
  return res?.data || {};
}

export async function unsaveJob(jobId) {
  const uid = resolveUserId();
  const params = new URLSearchParams();
  if (uid) params.set('user_identifier', uid);
  const qs = params.toString();
  const res = await API.delete(
    `/api/jobs/hub/saved/${encodeURIComponent(jobId)}${qs ? `?${qs}` : ''}`,
  );
  return res?.data || {};
}

export async function toggleSavedJob(jobId, jobSnapshot = null) {
  const res = await API.post('/api/jobs/hub/saved/toggle', {
    user_id: resolveUserId(),
    job_id: jobId,
    job_snapshot: jobSnapshot,
  });
  return res?.data || {};
}
