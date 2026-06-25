import API from '../api/axiosConfig';
import { resolveTelemetryUserId } from '../hooks/useTelemetry';

const FEEDBACK_TYPE_MAP = {
  Bug: 'Bug',
  'Feature request': 'Feature request',
  Abuse: 'Abuse',
  Payment: 'Payment',
  Other: 'Other',
};

export function buildFeedbackIdentity(userData) {
  const userId = resolveTelemetryUserId(userData);
  const email = String(localStorage.getItem('userEmail') || '').trim();
  const mobile = String(localStorage.getItem('userMobile') || '').trim();
  return {
    user_id: userId || undefined,
    user_email: email || undefined,
    user_mobile: mobile || undefined,
  };
}

export async function submitFeedbackReport({
  type,
  description,
  pageUrl,
  clientDevice,
  imageurl,
  userData,
}) {
  const normalizedType = FEEDBACK_TYPE_MAP[type] || type;
  const identity = buildFeedbackIdentity(userData);
  const formData = new FormData();

  formData.append('type', normalizedType);
  formData.append('description', String(description || '').trim());
  formData.append('pageUrl', String(pageUrl || window.location.href).trim());
  formData.append('clientDevice', JSON.stringify(clientDevice || {}));

  if (imageurl instanceof File) {
    formData.append('imageurl', imageurl);
  }

  Object.entries(identity).forEach(([key, value]) => {
    if (value) formData.append(key, value);
  });

  const res = await API.post('/api/feedback/submit', formData, {
    timeout: 20000,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res?.data || {};
}
