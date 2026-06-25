import API from '../../../../api/axiosConfig';
import { getAlertsSessionHeaders, hasAlertsSession } from '../utils/alertsSession';

const TIMEOUT_MS = 8000;
const EMPTY_BUNDLE = {
  stats: { unread: 0, total: 0, today: 0, high_priority: 0 },
  feed: [],
  categories: [],
};

function encodedId(userData) {
  const id =
    userData?.email ||
    userData?.mobile ||
    userData?.user_id ||
    localStorage.getItem('userEmail') ||
    localStorage.getItem('userMobile') ||
    '';
  return id ? encodeURIComponent(String(id).trim()) : '';
}

async function safeGet(path) {
  if (!hasAlertsSession()) return null;
  try {
    const res = await API.get(path, {
      headers: getAlertsSessionHeaders(),
      timeout: TIMEOUT_MS,
    });
    return res?.data?.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchEmployerAlertsBundle(userData) {
  const encoded = encodedId(userData);
  if (!encoded || !hasAlertsSession()) {
    return EMPTY_BUNDLE;
  }
  const base = `/api/alerts`;
  const [stats, feed, categories] = await Promise.all([
    safeGet(`${base}/employer-stats/${encoded}`),
    safeGet(`${base}/employer-feed/${encoded}`),
    safeGet(`${base}/employer-categories/${encoded}`),
  ]);
  return {
    stats: stats || EMPTY_BUNDLE.stats,
    feed: Array.isArray(feed) ? feed : [],
    categories: Array.isArray(categories) ? categories : [],
  };
}
