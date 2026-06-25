import API from '../../../api/axiosConfig';

const TIMEOUT_MS = 10000;

async function safeGet(path) {
  try {
    const res = await API.get(path, { timeout: TIMEOUT_MS });
    return res?.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchAdminAlertsBundle() {
  const body = await safeGet('/api/admin/notifications/bundle');
  if (body?.stats) {
    return {
      stats: body.stats,
      feed: Array.isArray(body.feed) ? body.feed : [],
      categories: Array.isArray(body.categories) ? body.categories : [],
    };
  }
  const [statsRes, feedRes, categoriesRes] = await Promise.all([
    safeGet('/api/admin/notifications/stats'),
    safeGet('/api/admin/notifications/feed'),
    safeGet('/api/admin/notifications/categories'),
  ]);
  return {
    stats: statsRes?.data ?? null,
    feed: Array.isArray(feedRes?.data) ? feedRes.data : [],
    categories: Array.isArray(categoriesRes?.data) ? categoriesRes.data : [],
  };
}

export async function markAdminAlertRead(alertId) {
  if (!alertId) return;
  await API.post(`/api/admin/notifications/mark-read/${encodeURIComponent(alertId)}`, null, {
    timeout: TIMEOUT_MS,
  });
  window.dispatchEvent(new Event('et:admin-alerts-changed'));
}

export async function markAllAdminAlertsRead() {
  await API.post('/api/admin/notifications/mark-all-read', null, { timeout: TIMEOUT_MS });
  window.dispatchEvent(new Event('et:admin-alerts-changed'));
}
