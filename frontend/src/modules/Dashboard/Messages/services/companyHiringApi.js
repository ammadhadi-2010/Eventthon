import API from '../../../../api/axiosConfig';

function employerId() {
  return (
    localStorage.getItem('userEmail') ||
    localStorage.getItem('userMobile') ||
    localStorage.getItem('user_id') ||
    ''
  );
}

export function resolveCandidateId(row = {}) {
  return String(row.from_user_id || row.candidate_user_id || '').trim();
}

function threadPayload(row) {
  return {
    employer_user_id: employerId(),
    candidate_user_id: resolveCandidateId(row),
    job_id: String(row.context_id || row.job_id || ''),
  };
}

export async function fetchCompanyHiringContext(row) {
  const payload = threadPayload(row);
  if (!payload.employer_user_id || !payload.candidate_user_id) return null;
  const { data } = await API.get('/api/messages/company-hiring-context', {
    params: payload,
  });
  return data?.data || null;
}

export async function setCompanyHiringStage(row, stage) {
  const { data } = await API.post('/api/messages/company-hiring-stage', {
    ...threadPayload(row),
    stage,
  });
  return data?.data || null;
}

export async function createRecruiterNote(row, body) {
  const { data } = await API.post('/api/messages/company-recruiter-notes', {
    ...threadPayload(row),
    body,
  });
  return data?.data || null;
}

export async function updateRecruiterNote(noteId, body) {
  const { data } = await API.patch(`/api/messages/company-recruiter-notes/${encodeURIComponent(noteId)}`, {
    employer_user_id: employerId(),
    body,
  });
  return data?.data || null;
}

export async function deleteRecruiterNote(noteId) {
  const { data } = await API.post(`/api/messages/company-recruiter-notes/${encodeURIComponent(noteId)}/delete`, {
    employer_user_id: employerId(),
  });
  return data?.data || null;
}

export async function assignCompanyConversation(row, assignee) {
  const { data } = await API.post('/api/messages/company-hiring-assign', {
    ...threadPayload(row),
    assignee_user_id: assignee?.userId || '',
    assignee_email: assignee?.email || '',
    assignee_name: assignee?.name || '',
    assignee_role: assignee?.role || 'recruiter',
  });
  return data?.data || null;
}

export async function setCompanyConversationLabels(row, labels) {
  const { data } = await API.post('/api/messages/company-hiring-labels', {
    ...threadPayload(row),
    labels,
  });
  return data?.data || null;
}

export async function logCompanyHiringActivity(row, event_type, detail = '') {
  const { data } = await API.post('/api/messages/company-hiring-activity', {
    ...threadPayload(row),
    event_type,
    detail,
  });
  return data?.data || null;
}

export async function fetchCompanyHiringAnalytics() {
  const { data } = await API.get('/api/messages/company-hiring-analytics', {
    params: { employer_user_id: employerId() },
  });
  return data?.data || null;
}
