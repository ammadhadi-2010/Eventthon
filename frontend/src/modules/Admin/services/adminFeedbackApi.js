import API from '../../../api/axiosConfig';

const TIMEOUT_MS = 12000;

export async function fetchAdminFeedbackReports(filters = {}) {
  const params = {};
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.priority && filters.priority !== 'all') params.priority = filters.priority;
  if (filters.search) params.search = filters.search;

  const res = await API.get('/api/admin/feedback', { params, timeout: TIMEOUT_MS });
  return {
    rows: res?.data?.data || [],
    summary: res?.data?.summary || {
      total: 0,
      new: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
    },
  };
}

export async function sendFeedbackReply(reportId, message) {
  const res = await API.post(
    `/api/feedback/reply/${encodeURIComponent(reportId)}`,
    { message, admin_name: 'EventThon Engineering' },
    { timeout: TIMEOUT_MS },
  );
  return res?.data?.data || null;
}

export async function resolveFeedbackReport(reportId) {
  const res = await API.post(
    `/api/feedback/resolve/${encodeURIComponent(reportId)}`,
    {},
    { timeout: TIMEOUT_MS },
  );
  return res?.data?.data || null;
}

export async function updateFeedbackStatus(reportId, status) {
  const res = await API.post(
    `/api/feedback/status/${encodeURIComponent(reportId)}`,
    { status },
    { timeout: TIMEOUT_MS },
  );
  return res?.data?.data || null;
}
