import API from '../../../../api/axiosConfig';
import { getGigsSessionHeaders, hasGigsSession } from '../utils/gigsSession';

const TIMEOUT = 30000;

function headers(json = true) {
  const base = getGigsSessionHeaders();
  if (json) base['Content-Type'] = 'application/json';
  return base;
}

export async function fetchGigsList(params = {}) {
  const res = await API.get('/api/gigs', {
    headers: getGigsSessionHeaders(),
    timeout: TIMEOUT,
    params: { limit: 40, skip: 0, status: 'Published', ...params },
  });
  const body = res?.data || {};
  return {
    gigs: Array.isArray(body.gigs) ? body.gigs : [],
    total: Number(body.total || 0),
  };
}

export async function createGigStart(payload) {
  if (!hasGigsSession()) throw new Error('You must be logged in to create a gig');
  const res = await API.post('/api/gigs/create', payload, {
    headers: headers(),
    timeout: TIMEOUT,
  });
  return res?.data || {};
}

export async function saveGigPricing(gigId, payload) {
  const res = await API.patch(`/api/gigs/create/${encodeURIComponent(gigId)}/pricing`, payload, {
    headers: headers(),
    timeout: TIMEOUT,
  });
  return res?.data || {};
}

export async function uploadGigGallery(gigId, formData) {
  const res = await API.post(`/api/gigs/create/${encodeURIComponent(gigId)}/gallery`, formData, {
    headers: getGigsSessionHeaders(),
    timeout: 60000,
  });
  return res?.data || {};
}

export async function publishGig(gigId, payload) {
  const res = await API.patch(`/api/gigs/create/${encodeURIComponent(gigId)}/publish`, payload, {
    headers: headers(),
    timeout: TIMEOUT,
  });
  return res?.data || {};
}

export async function postGigContact(payload) {
  const res = await API.post('/api/gigs/actions/contact', payload, {
    headers: headers(),
    timeout: TIMEOUT,
  });
  return res?.data || {};
}

export async function postGigOrder(payload) {
  const res = await API.post('/api/gigs/orders/', payload, {
    headers: headers(),
    timeout: TIMEOUT,
  });
  return res?.data || {};
}

export async function postGigReport(payload) {
  const res = await API.post('/api/gigs/actions/report', payload, {
    headers: headers(),
    timeout: TIMEOUT,
  });
  return res?.data || {};
}

export async function fetchGigHubMetrics() {
  const res = await API.get('/api/gigs/hub/metrics', {
    headers: getGigsSessionHeaders(),
    timeout: TIMEOUT,
  });
  return Array.isArray(res?.data?.stats) ? res.data.stats : [];
}

export async function fetchGigEarningsSummary(sellerUserId, period = 'month') {
  const res = await API.get('/api/gigs/earnings/summary', {
    headers: getGigsSessionHeaders(),
    timeout: TIMEOUT,
    params: { seller_user_id: sellerUserId, period },
  });
  return res?.data?.summary || null;
}

export async function submitGigReview(payload) {
  const res = await API.post('/api/gigs/reviews/', payload, {
    headers: headers(),
    timeout: TIMEOUT,
  });
  return res?.data?.review || null;
}
