import API from '../../../../api/axiosConfig';

import { getAlertsIdentifier, getAlertsSessionHeaders, hasAlertsSession } from '../utils/alertsSession';



const TIMEOUT_MS = 8000;

const EMPTY_BUNDLE = { stats: { unread: 0, total: 0, today: 0, high_priority: 0 }, feed: [], categories: [] };



function alertHeaders() {

  return { ...getAlertsSessionHeaders(), 'Content-Type': 'application/json' };

}



function encodedId(userData) {

  const id = getAlertsIdentifier(userData);

  return id ? encodeURIComponent(id) : '';

}



async function alertsGet(path, userData) {

  if (!hasAlertsSession()) return null;

  try {

    const res = await API.get(path, { headers: alertHeaders(), timeout: TIMEOUT_MS });

    return res?.data?.data ?? null;

  } catch (err) {

    if (err?.code !== 'ECONNABORTED') {

      console.warn('Alerts GET failed:', path, err?.response?.status || err?.message);

    }

    return null;

  }

}



async function alertsMutate(method, path, userData, body) {

  if (!hasAlertsSession()) throw new Error('You must be logged in to manage alerts');

  const config = { headers: alertHeaders(), timeout: TIMEOUT_MS };

  const res =

    method === 'put'

      ? await API.put(path, body, config)

      : await API.post(path, body, config);

  return res?.data;

}



export const fetchAlertsBundle = async (userData) => {

  const encoded = encodedId(userData);

  if (!encoded) return EMPTY_BUNDLE;



  const bundlePath = `/api/alerts/bundle/${encoded}`;

  try {

    const res = await API.get(bundlePath, { headers: alertHeaders(), timeout: TIMEOUT_MS });

    const data = res?.data?.data;

    if (data) {

      return {

        stats: data.stats || EMPTY_BUNDLE.stats,

        feed: Array.isArray(data.feed) ? data.feed : [],

        categories: Array.isArray(data.categories) ? data.categories : [],

      };

    }

  } catch (err) {

    if (err?.code !== 'ECONNABORTED') {

      console.warn('Alerts bundle failed:', err?.response?.status || err?.message);

    }

  }



  const base = `/api/alerts`;

  const [stats, feed, categories] = await Promise.all([

    alertsGet(`${base}/stats/${encoded}`, userData),

    alertsGet(`${base}/feed/${encoded}`, userData),

    alertsGet(`${base}/categories/${encoded}`, userData),

  ]);



  return {

    stats: stats || EMPTY_BUNDLE.stats,

    feed: Array.isArray(feed) ? feed : [],

    categories: Array.isArray(categories) ? categories : [],

  };

};



export const fetchNotificationsList = async () => {

  if (!hasAlertsSession()) return [];

  try {

    const res = await API.get('/api/notifications', {

      headers: alertHeaders(),

      timeout: TIMEOUT_MS,

    });

    return Array.isArray(res?.data?.data) ? res.data.data : [];

  } catch {

    return [];

  }

};



export const markAllAlertsRead = async (userData) => {

  const encoded = encodedId(userData);

  if (!encoded) return;

  await alertsMutate('post', `/api/alerts/mark-all-read/${encoded}`, userData);

  try {

    await API.post('/api/notifications/read-all', null, {

      headers: alertHeaders(),

      timeout: TIMEOUT_MS,

    });

  } catch {

    /* alias optional */

  }

};



export const fetchAlertItem = async (alertId) => {

  if (!alertId || !hasAlertsSession()) return null;

  const res = await API.get(`/api/alerts/item/${encodeURIComponent(alertId)}`, {

    headers: alertHeaders(),

    timeout: TIMEOUT_MS,

  });

  return res?.data?.data || null;

};



export const markAlertRead = async (alertId) => {

  if (!alertId || !hasAlertsSession()) return null;

  const path = `/api/notifications/${encodeURIComponent(alertId)}/read`;

  try {

    const res = await API.put(path, null, { headers: alertHeaders(), timeout: TIMEOUT_MS });

    return res?.data?.data || null;

  } catch {

    const res = await API.put(`/api/alerts/mark-read/${encodeURIComponent(alertId)}`, null, {

      headers: alertHeaders(),

      timeout: TIMEOUT_MS,

    });

    return res?.data?.data || null;

  }

};


